$(document).ready(function(){
  const canvas = $('#main-canvas')[0];
  let warper = null;

  const holder = document.getElementById('drop-area');

  const ctx = canvas.getContext('2d');
  const img = document.getElementById('template');
  ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);

  $('.allow-drag').each(function () {
    this.ondragstart = function (e) {
      e.dataTransfer.setData('text', this.src);
      console.log(e.dataTransfer.getData('text'));
      console.log(e);
    };
  });

  $('.redraw').change(function () {
    if (warper) {
      warper.redraw();
    }
  });

  holder.ondragover = function () { this.className = 'hover'; return false; };
  holder.ondragend = function () { this.className = ''; return false; };
  holder.ondrop = function (e) {
    this.className = '';
    e.stopPropagation();
    e.preventDefault();

    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      // Prevent any non-image file type from being read.
      if(!file.type.match(/image.*/)){
        console.log('The dropped file is not an image: ', file.type);
        return;
      }
      reader.onload = function (event) {
        console.log(event.target);
        const img = render(event.target.result, function (imageData, template) {
          warper = new ImgWarper.PointDefiner(canvas, img, imageData, template);
        });
      };
      reader.readAsDataURL(file);
    } else {
      const src = e.dataTransfer.getData('text');
      const img = render(src, function (imageData, template) {
        warper = new ImgWarper.PointDefiner(canvas, img, imageData, template);
      });
    }
    return false;
  };
});

const MAX_HEIGHT = 500;
function render(src, callback){
  const image = new Image();
  const templateImg = document.getElementById('template');
  image.onload = function(){
    const canvas = document.getElementById('myCanvas');
    const templateCanvas = document.getElementById('templateCanvas');
    if(image.height > MAX_HEIGHT) {
      image.width *= MAX_HEIGHT / image.height;
      image.height = MAX_HEIGHT;
    }
    const ctx = canvas.getContext('2d');
    const templateCtx = templateCanvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = image.width;
    canvas.height = image.height;
    templateCanvas.width = canvas.width;
    templateCanvas.height = canvas.height;
    ctx.drawImage(image, 0, 0, image.width, image.height);
    templateCtx.drawImage(templateImg, 0, 0, templateImg.width, templateImg.height, 0, 0, canvas.width, canvas.height);

    callback(
      ctx.getImageData(0, 0, image.width, image.height),
      templateCtx.getImageData(0, 0, image.width, image.height)
    );
  };
  image.src = src;
  return image;
}
