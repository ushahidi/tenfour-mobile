import { NgModule } from '@angular/core';
import { TruncatePipe } from './truncate';

@NgModule({
  declarations: [
    TruncatePipe,
  ],
  imports: [ ],
  exports: [
    TruncatePipe
  ]
})
export class TruncateModule {}
