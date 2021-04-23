class BilinearInterpolation {

  constructor(width, height, imgTargetData){
    this.width = width;
    this.height = height;
    this.imgTargetData = imgTargetData;
  }

  generate(source, fromGrid, toGrid) {
    for (let i = 0; i < toGrid.length; ++i) {
      this.fill(source, toGrid[i], fromGrid[i]);
    }
    return this.imgTargetData;
  }

  fill(source, sourcePoints, fillingPoints) {
    let i, j;
    let srcX, srcY;
    let x0 = fillingPoints[0].x;
    let x1 = fillingPoints[2].x;
    let y0 = fillingPoints[0].y;
    let y1 = fillingPoints[2].y;
    x0 = Math.max(x0, 0);
    y0 = Math.max(y0, 0);
    x1 = Math.min(x1, this.width - 1);
    y1 = Math.min(y1, this.height - 1);

    let xl, xr, topX, topY, bottomX, bottomY;
    let yl, yr, index;
    for (i = x0; i <= x1; ++i) {
      xl = (i - x0) / (x1 - x0);
      xr = 1 - xl;
      topX = xr * sourcePoints[0].x + xl * sourcePoints[1].x;
      topY = xr * sourcePoints[0].y + xl * sourcePoints[1].y;
      bottomX = xr * sourcePoints[3].x + xl * sourcePoints[2].x;
      bottomY = xr * sourcePoints[3].y + xl * sourcePoints[2].y;
      for (j = y0; j <= y1; ++j) {
        yl = (j - y0) / (y1 - y0);
        yr = 1 - yl;
        srcX = topX * yr + bottomX * yl;
        srcY = topY * yr + bottomY * yl;
        index = ((j * this.width) + i) * 4;
        if (srcX < 0 || srcX > this.width - 1 ||
          srcY < 0 || srcY > this.height - 1) {
          this.imgTargetData.data[index] = 0;
          this.imgTargetData.data[index + 1] = 0;
          this.imgTargetData.data[index + 2] = 0;
          this.imgTargetData.data[index + 3] = 0;
          continue;
        }
        const srcX1 = Math.floor(srcX);
        const srcY1 = Math.floor(srcY);
        const base = ((srcY1 * this.width) + srcX1) * 4;
        //rgb = this.nnquery(srcX, srcY);
        this.imgTargetData.data[index] = source[base];
        this.imgTargetData.data[index + 1] = source[base + 1];
        this.imgTargetData.data[index + 2] = source[base + 2];
        this.imgTargetData.data[index + 3] = source[base + 3];
      }
    }
  }
}
