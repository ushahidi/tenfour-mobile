import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RollcallRepliesPage } from './rollcall-replies';

@NgModule({
  declarations: [
    RollcallRepliesPage,
  ],
  imports: [
    IonicPageModule.forChild(RollcallRepliesPage),
  ],
  exports: [
    RollcallRepliesPage
  ]
})
export class RollcallRepliesModule {}
