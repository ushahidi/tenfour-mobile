import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RollcallSendPage } from './rollcall-send';

@NgModule({
  declarations: [
    RollcallSendPage,
  ],
  imports: [
    IonicPageModule.forChild(RollcallSendPage),
  ],
  exports: [
    RollcallSendPage
  ]
})
export class RollcallSendModule {}
