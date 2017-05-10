import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RollcallListPage } from './rollcall-list';

@NgModule({
  declarations: [
    RollcallListPage,
  ],
  imports: [
    IonicPageModule.forChild(RollcallListPage),
  ],
  exports: [
    RollcallListPage
  ]
})
export class RollcallListModule {}
