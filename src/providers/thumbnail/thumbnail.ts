import { Injectable } from '@angular/core';

@Injectable()
export class ThumbnailProvider {

  MAX_HEIGHT:number = 160;
  MAX_WIDTH:number = 160;
  MIME_TYPE:string = 'image/jpeg';

  constructor() {
  }

  toThumbnailDataURL(img, maxHeight?:number, maxWidth?:number, mimeType?:string) {
      let canvas = document.createElement('canvas');
      let ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      maxHeight = maxHeight ? maxHeight : this.MAX_HEIGHT;
      maxWidth = maxWidth ? maxWidth : this.MAX_WIDTH;

      if (img.width > img.height) {
        if (img.width > maxWidth) {
          img.height *= maxWidth / img.width;
          img.width = maxWidth;
        }
      } else {
        if (img.height > maxHeight) {
          img.width *= maxHeight / img.height;
          img.height = maxHeight;
        }
      }
      canvas.width = img.width;
      canvas.height = img.height;

      var ctx2 = canvas.getContext("2d");
      ctx2.drawImage(img, 0, 0, img.width, img.height);

      return canvas.toDataURL(mimeType ? mimeType : this.MIME_TYPE);
  }

}
