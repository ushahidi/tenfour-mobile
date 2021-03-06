import { Injectable, Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'dayOfMonth'
})
@Injectable()
export class DayOfMonthPipe implements PipeTransform {

  transform(value, args) {
    if (value) {
      return moment.utc(value).local().format('Do');
    }
    return "";
  }

}
