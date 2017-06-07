import { NgModule } from '@angular/core';
import { TitleizePipe } from './titleize';

@NgModule({
  declarations: [
    TitleizePipe,
  ],
  imports: [ ],
  exports: [
    TitleizePipe
  ]
})
export class TitleizeModule {}
