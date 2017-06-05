import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RollcallReplyPage } from './rollcall-reply';

@NgModule({
  declarations: [
    RollcallReplyPage,
  ],
  imports: [
    IonicPageModule.forChild(RollcallReplyPage),
  ],
  exports: [
    RollcallReplyPage
  ]
})
export class RollcallReplyModule {}
