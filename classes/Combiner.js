class Combiner {
  constructor(workingCanvas, image) {
    this.workingCtx = workingCanvas.getContext('2d');
    this.width = image.width;
    this.height = image.height;
  }

  combineImages(templateImgData, imgData) {
    const combinedImageData = this.workingCtx.createImageData(this.width, this.height);
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
