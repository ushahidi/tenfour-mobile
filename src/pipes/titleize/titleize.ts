import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'titleize'
})
@Injectable()
export class TitleizePipe implements PipeTransform {

  transform(value: string, args: string[]=null): any {
    if (!value) return value;
    return value.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

}
