import { Injectable } from '@angular/core';

@Injectable()
export class ThumbnailProvider {

  constructor() {
  }

  toThumbnailDataURL(img) {
      let canvas = document.createElement('canvas');
      let ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      var MAX_WIDTH = 160;
      var MAX_HEIGHT = 160;

      if (img.width > img.height) {
        if (img.width > MAX_WIDTH) {
          img.height *= MAX_WIDTH / img.width;
          img.width = MAX_WIDTH;
        }
      } else {
        if (img.height > MAX_HEIGHT) {
          img.width *= MAX_HEIGHT / img.height;
          img.height = MAX_HEIGHT;
        }
      }
      canvas.width = img.width;
      canvas.height = img.height;

      var ctx2 = canvas.getContext("2d");
      ctx2.drawImage(img, 0, 0, img.width, img.height);

      return canvas.toDataURL("image/jpeg");
  }

}
