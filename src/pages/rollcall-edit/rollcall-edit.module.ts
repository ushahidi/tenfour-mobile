import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RollcallEditPage } from './rollcall-edit';

@NgModule({
  declarations: [
    RollcallEditPage,
  ],
  imports: [
    IonicPageModule.forChild(RollcallEditPage),
  ],
  exports: [
    RollcallEditPage
  ]
})
export class RollcallEditModule {}
