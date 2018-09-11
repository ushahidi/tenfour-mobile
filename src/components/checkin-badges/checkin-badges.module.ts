import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CheckinBadgesComponent } from './checkin-badges';

@NgModule({
  declarations: [
    CheckinBadgesComponent,
  ],
  imports: [
    IonicPageModule.forChild(CheckinBadgesComponent),
  ],
  exports: [
    CheckinBadgesComponent
  ]
})
export class CheckinBadgesModule {}
