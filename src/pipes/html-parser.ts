import { Injectable, Pipe } from '@angular/core';

@Pipe({
  name: 'htmlParser'
})
@Injectable()
export class HtmlParserPipe {
  transform(value: string, args: any[]) {
    let regex1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&#\/%?=~_|!:,.;]*[-A-Z0-9+&#\/%=~_|])/gim;
    let html = value.replace(regex1, '<a href="$1" target="_blank">$1</a>');

    let regex2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    html = html.replace(regex2, '$1<a href="http://$2" target="_blank">$2</a>');

    let regex3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    html = html.replace(regex3, '<a href="mailto:$1" target="_system">$1</a>');
    return html;
  }
}
