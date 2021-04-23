class Warper {
  constructor(canvas, img, imgData, template) {
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
    this.ctx = canvas.getContext('2d');
    const imageTargetData = this.ctx.createImageData(this.width, this.height);
    this.bilinearInterpolation = new BilinearInterpolation(this.width, this.height, imageTargetData);

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.putImageData(imgData, 0, 0);

    this.grid = [];
    for (let i = 0; i < this.width; i += this.gridSize) {
      for (let j = 0; j < this.height; j += this.gridSize) {
        this.grid.push([
          new Point(i, j),
          new Point(i + this.gridSize, j),
          new Point(i + this.gridSize, j + this.gridSize),
          new Point(i, j + this.gridSize)
        ]);
      }
    }
  }

  warp(fromPoints, toPoints) {
    const deformation = new AffineDeformation(toPoints, fromPoints, this.alpha);
    const transformedGrid = [];
    for (let i = 0; i < this.grid.length; ++i) {
      transformedGrid[i] = [
        deformation.pointMover(this.grid[i][0]),
        deformation.pointMover(this.grid[i][1]),
        deformation.pointMover(this.grid[i][2]),
        deformation.pointMover(this.grid[i][3])
      ];
    }
    return this.bilinearInterpolation.generate(this.imgData, this.grid, transformedGrid);
  }

  drawGrid(fromPoints, toPoints) {
    // Forward warping.
    const deformation = new AffineDeformation(
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
  }

  redrawTemplate() {
    const img = document.getElementById('template');
    this.ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, this.canvas.width, this.canvas.height);
  }

  combineImages(templateImgData, imgData) {
    const combinedImageData = this.ctx.createImageData(this.width, this.height);
    for (let i = 0; i < templateImgData.data.length; i++) {
      if (imgData.data[i] === 0) {
        combinedImageData.data[i] = templateImgData.data[i];
      } else {
        combinedImageData.data[i] = imgData.data[i];
      }
    }
    return combinedImageData;
  }

}
