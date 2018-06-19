import { NgModule } from '@angular/core';
import { DayOfMonthPipe } from './day-of-month';

@NgModule({
  declarations: [
    DayOfMonthPipe,
  ],
  imports: [ ],
  exports: [
    DayOfMonthPipe
  ]
})
export class DayOfMonthModule {}
