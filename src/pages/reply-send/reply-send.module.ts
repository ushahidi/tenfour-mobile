import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReplySendPage } from './reply-send';

@NgModule({
  declarations: [
    ReplySendPage,
  ],
  imports: [
    IonicPageModule.forChild(ReplySendPage),
  ],
  exports: [
    ReplySendPage
  ]
})
export class RollcallReplyModule {}
