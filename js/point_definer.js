ImgWarper.PointDefiner = function(canvas, image, imgData, template, oriPoints = [], dstPoints = []) {
  this.oriPoints = oriPoints;
  this.dstPoints = dstPoints;

  //set up points for change;
  const c = canvas;
  this.canvas = canvas;
  const that = this;
  this.dragging_ = false;
  this.computing_ = false;
  $(c).unbind();
  $(c).bind('mousedown', function (e) { that.touchStart(e); });
  $(c).bind('mousemove', this.throttle(100, function (e) { that.touchDrag(e); }));
  $(c).bind('mouseup', function (e) { that.touchEnd(e); });
  this.currentPointIndex = -1;
  this.imgWarper = new ImgWarper.Warper(c, image, imgData, template);
};

ImgWarper.PointDefiner.prototype.touchEnd = function() {
  this.dragging_ = false;
};

ImgWarper.PointDefiner.prototype.touchDrag = function(e) {
  if (this.computing_ || !this.dragging_ || this.currentPointIndex < 0) {
    return;
  }
  this.computing_ = true;
  e.preventDefault();
  const endX = (e.offsetX || e.clientX - $(e.target).offset().left);
  const endY = (e.offsetY || e.clientY - $(e.target).offset().top);

  this.dstPoints[this.currentPointIndex] = new ImgWarper.Point(endX, endY);
  this.redraw();
  this.computing_ = false;
};

ImgWarper.PointDefiner.prototype.redraw = function () {
  const showControl = document.getElementById('show-control');
  if (this.oriPoints.length < 3) {
    if (!showControl || showControl.checked) {
      this.redrawCanvas();
    }
    return;
  }
  this.imgWarper.warp(this.oriPoints, this.dstPoints);
  this.showTransformation(this.oriPoints, this.dstPoints);
  if (!showControl || showControl.checked) {
    this.redrawCanvas();
  }
};


ImgWarper.PointDefiner.prototype.touchStart = function(e) {
  this.dragging_ = true;
  e.preventDefault();
  const startX = (e.offsetX || e.clientX - $(e.target).offset().left);
  const startY = (e.offsetY || e.clientY - $(e.target).offset().top);
  const q = new ImgWarper.Point(startX, startY);

  if (e.ctrlKey) {
    this.oriPoints.push(q);
    this.dstPoints.push(q);
  } else if (e.shiftKey) {
    const pointIndex = this.getCurrentPointIndex(q);
    if (pointIndex >= 0) {
      this.oriPoints.splice(pointIndex, 1);
      this.dstPoints.splice(pointIndex, 1);
    }
  } else {
    this.currentPointIndex = this.getCurrentPointIndex(q);
  }
  this.redraw();
};

ImgWarper.PointDefiner.prototype.getCurrentPointIndex = function(q) {
  let currentPoint = -1;

  for (let i = 0 ; i< this.dstPoints.length; i++){
    if (this.dstPoints[i].InfintyNormDistanceTo(q) <= 20) {
      currentPoint = i;
      return i;
    }
  }
  return currentPoint;
};

ImgWarper.PointDefiner.prototype.redrawCanvas = function() {
  const ctx = this.canvas.getContext('2d');
  for (let i = 0; i < this.oriPoints.length; i++) {
    if (i < this.dstPoints.length) {
      if (i == this.currentPointIndex) {
        this.drawOnePoint(this.dstPoints[i], ctx, 'orange');
      } else {
        this.drawOnePoint(this.dstPoints[i], ctx, '#6373CF');
      }

      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.moveTo(this.oriPoints[i].x, this.oriPoints[i].y);
      ctx.lineTo(this.dstPoints[i].x, this.dstPoints[i].y);
      //ctx.strokeStyle = '#691C50';
      ctx.stroke();
    } else {
      this.drawOnePoint(this.oriPoints[i], ctx, '#119a21');
    }
  }
  ctx.stroke();
};

ImgWarper.PointDefiner.prototype.drawOnePoint = function(point, ctx, color) {
  const radius = 10;
  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.arc(parseInt(point.x), parseInt(point.y), radius, 0, 2 * Math.PI, false);
  ctx.strokeStyle = color;
  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.arc(parseInt(point.x), parseInt(point.y), 3, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  ctx.fill();
};

ImgWarper.PointDefiner.prototype.showTransformation = function(oriPoints, dstPoints) {
  if (window.transformationList) {
    window.transformationList.innerHTML = oriPoints.map((ori, i) => ({ ori, dst: dstPoints[i] }))
      .map(({ ori, dst }) => `<li>(${ori.x}, ${ori.y}) => (${dst.x}, ${dst.y})</li>`)
      .join('\n');
  }
};

ImgWarper.PointDefiner.prototype.throttle = function(limit, func) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
