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
        let format = args;
        return moment.utc(value).local().format(format);
      }
      return moment.utc(value).local().calendar(null, {
        lastDay: 'h:mm A [Yesterday]',
        sameDay: 'h:mm A [Today]',
        nextDay: 'h:mm A [Tomorrow]',
        lastWeek: 'h:mm A MMMM Do',
        nextWeek: 'h:mm A MMMM Do',
        sameElse: 'MMMM Do, YYYY'
      });
    }
    return "";
  }
}
