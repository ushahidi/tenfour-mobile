import { NgModule } from '@angular/core';
import { HtmlParserPipe } from './html-parser';

@NgModule({
  declarations: [
    HtmlParserPipe,
  ],
  imports: [ ],
  exports: [
    HtmlParserPipe
  ]
})
export class HtmlParserModule {}
