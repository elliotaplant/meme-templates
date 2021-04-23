function render(){
  const image = document.getElementById('dropped');
  const templateImg = document.getElementById('template');
  const workingCanvas = document.getElementById('myCanvas');
  const templateCanvas = document.getElementById('templateCanvas');
  const combinedCanvas = document.getElementById('combined');

  const templateCtx = templateCanvas.getContext('2d');
  const ctx = workingCanvas.getContext('2d');

  templateCtx.drawImage(templateImg, 0, 0, templateImg.width, templateImg.height,
    0, 0, templateImg.width, templateImg.height);
  ctx.drawImage(image, 0, 0, image.width, image.height);

  ctx.clearRect(0, 0, workingCanvas.width, workingCanvas.height);
  const imageData = ctx.getImageData(0, 0, image.width, image.height);
  const templateImgData = templateCtx.getImageData(0, 0, image.width, image.height);

  return new ImgWarper.PointDefiner(combinedCanvas, image, imageData, templateImgData,
    [new ImgWarper.Point(1, 1), new ImgWarper.Point(2, 2), new ImgWarper.Point(3, 3)],
    [new ImgWarper.Point(2, 2), new ImgWarper.Point(20, 20), new ImgWarper.Point(33, 345)]
  );
}

$(document).ready(() => {
  setTimeout(() => {
    const warper = render();
    warper.redraw();
  }, 1000);
});
