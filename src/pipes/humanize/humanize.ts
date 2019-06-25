import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'humanize'
})
export class HumanizePipe implements PipeTransform {

  transform(value:string, ...args) {
    let pretty = [];
    if (value && value.length > 0) {
      if (value.indexOf("email") != -1) {
        pretty.push("Email");
      }
      if (value.indexOf("sms") != -1) {
        pretty.push("SMS");
      }
      if (value.indexOf("slack") != -1) {
        pretty.push("Slack");
      }
      if (value.indexOf("app") != -1) {
        pretty.push("TenFour App");
      }
      if (value.indexOf("voice") != -1) {
        pretty.push("Voice Call");
      }
    }
    return pretty.join(", ");
  }

}
