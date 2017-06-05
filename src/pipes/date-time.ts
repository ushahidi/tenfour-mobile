import { Injectable, Pipe } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'dateTime'
})
@Injectable()
export class DateTimePipe {

  transform(value, args) {
    if (value) {
      if (args) {
        var date = moment(value).format('YYYY-MM-DD hh:mm:ss');
        let format = args;
        return moment(date).format(format);
      }
      return moment(value).fromNow();
    }
    return "";
  }
}
