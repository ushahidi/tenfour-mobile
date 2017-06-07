import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReplyListPage } from './reply-list';

@NgModule({
  declarations: [
    ReplyListPage,
  ],
  imports: [
    IonicPageModule.forChild(ReplyListPage),
  ],
  exports: [
    ReplyListPage
  ]
})
export class RollcallRepliesModule {}
