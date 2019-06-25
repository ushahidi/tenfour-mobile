import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
@Injectable()
export class TruncatePipe implements PipeTransform {

  transform(value:string, args:number=20) {
    let text = "" + value;
    let limit = args ? args : 10;
    let words = text.split(" ");
    if (words.length > limit) {
      return words.slice(0, limit).join(" ").concat("...");
    }
    return words.slice(0, limit).join(" ");
  }

}
