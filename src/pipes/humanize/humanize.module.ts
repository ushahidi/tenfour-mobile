import { NgModule } from '@angular/core';
import { HumanizePipe } from './humanize';

@NgModule({
  declarations: [
    HumanizePipe
  ],
  imports: [ ],
  exports: [
    HumanizePipe
  ]
})
export class HumanizeModule {}
