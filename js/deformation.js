ImgWarper.Warper = function(canvas, img, imgData, template) {
  this.alpha = 1;
  this.gridSize = 20;
  this.canvas = canvas;
  this.template = template;
  this.ctx = canvas.getContext('2d');

  const source = img;
  this.width = source.width;
  this.height = source.height;
  this.imgData = imgData.data;
  canvas.width = source.width;
  canvas.height = source.height;
  this.bilinearInterpolation = new ImgWarper.BilinearInterpolation(this.width, this.height, canvas);

  this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.putImageData(imgData, 0, 0);
  console.log('drawn');

  this.grid = [];
  for (let i = 0; i < this.width; i += this.gridSize) {
    for (let j = 0; j < this.height; j += this.gridSize) {
      this.grid.push([
        new ImgWarper.Point(i, j),
        new ImgWarper.Point(i + this.gridSize, j),
        new ImgWarper.Point(i + this.gridSize, j + this.gridSize),
        new ImgWarper.Point(i, j + this.gridSize)
      ]);
    }
  }
};

ImgWarper.Warper.prototype.warp = function(fromPoints, toPoints) {
  const deformation = new ImgWarper.AffineDeformation(toPoints, fromPoints, this.alpha);
  const transformedGrid = [];
  for (let i = 0; i < this.grid.length; ++i) {
    transformedGrid[i] = [
      deformation.pointMover(this.grid[i][0]),
      deformation.pointMover(this.grid[i][1]),
      deformation.pointMover(this.grid[i][2]),
      deformation.pointMover(this.grid[i][3])
    ];
  }
  const newImg = this.bilinearInterpolation.generate(this.imgData, this.grid, transformedGrid);
  const combinedImg = this.combineImages(this.template, newImg);
  this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.putImageData(combinedImg, 0, 0);
};

ImgWarper.Warper.prototype.drawGrid = function(fromPoints, toPoints) {
  // Forward warping.
  const deformation = new ImgWarper.AffineDeformation(
    fromPoints,
    toPoints,
    this.alpha
  );
  const context = this.canvas.getContext('2d');
  for (let i = 0; i < this.grid.length; ++i) {
    context.beginPath();
    let point = deformation.pointMover(this.grid[i][0]);
    context.moveTo(point.x, point.y);
    for (let j = 1; j < 4; ++j) {
      point = deformation.pointMover(this.grid[i][j]);
      context.lineTo(point.x, point.y);
    }
    context.strokeStyle = 'rgba(170, 170, 170, 0.5)';
    context.stroke();
  }
};

ImgWarper.AffineDeformation = function(fromPoints, toPoints, alpha) {
  this.w = null;
  this.pRelative = null;
  this.qRelative = null;
  this.A = null;
  if (fromPoints.length != toPoints.length) {
    console.error('Points are not of same length.');
    return;
  }
  this.n = fromPoints.length;
  this.fromPoints = fromPoints;
  this.toPoints = toPoints;
  this.alpha = alpha;
};

ImgWarper.AffineDeformation.prototype.pointMover = function(point) {
  if (null == this.pRelative || this.pRelative.length < this.n) {
    this.pRelative = new Array(this.n);
  }
  if (null == this.qRelative || this.qRelative.length < this.n) {
    this.qRelative = new Array(this.n);
  }
  if (null == this.w || this.w.length < this.n) {
    this.w = new Array(this.n);
  }
  if (null == this.A || this.A.length < this.n) {
    this.A = new Array(this.n);
  }

  for (let i = 0; i < this.n; ++i) {
    const t = this.fromPoints[i].subtract(point);
    this.w[i] = Math.pow(t.x * t.x + t.y * t.y, -this.alpha);
  }

  const pAverage = ImgWarper.Point.weightedAverage(this.fromPoints, this.w);
  const qAverage = ImgWarper.Point.weightedAverage(this.toPoints, this.w);

  for (let i = 0; i < this.n; ++i) {
    this.pRelative[i] = this.fromPoints[i].subtract(pAverage);
    this.qRelative[i] = this.toPoints[i].subtract(qAverage);
  }

  let B = new ImgWarper.Matrix22(0, 0, 0, 0);

  for (let i = 0; i < this.n; ++i) {
    B.addM(this.pRelative[i].wXtX(this.w[i]));
  }

  B = B.inverse();
  for (let j = 0; j < this.n; ++j) {
    this.A[j] =
      point
        .subtract(pAverage)
        .multiply(B)
        .dotP(this.pRelative[j]) * this.w[j];
  }

  let r = qAverage; //r is an point
  for (let j = 0; j < this.n; ++j) {
    r = r.add(this.qRelative[j].multiply_d(this.A[j]));
  }
  return r;
};

ImgWarper.Warper.prototype.redrawTemplate = function() {
  const img = document.getElementById('template');
  this.ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, this.canvas.width, this.canvas.height);
};

ImgWarper.Warper.prototype.combineImages = function(templateImgData, imgData) {
  const combinedImageData = this.ctx.createImageData(this.width, this.height);
  for (let i = 0; i < templateImgData.data.length; i++) {
    if (imgData.data[i] === 0) {
      combinedImageData.data[i] = templateImgData.data[i];
    } else {
      combinedImageData.data[i] = imgData.data[i];
    }
  }
  return combinedImageData;
};
