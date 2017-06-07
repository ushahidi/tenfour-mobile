import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RollcallPeoplePage } from './rollcall-people';

@NgModule({
  declarations: [
    RollcallPeoplePage,
  ],
  imports: [
    IonicPageModule.forChild(RollcallPeoplePage),
  ],
  exports: [
    RollcallPeoplePage
  ]
})
export class RollcallPeopleModule {}
