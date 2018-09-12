import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CheckinBadgesComponent } from './checkin-badges';
import { CheckinPopoverModule } from '../checkin-popover/checkin-popover.module';

@NgModule({
  declarations: [
    CheckinBadgesComponent,
  ],
  imports: [
    CheckinPopoverModule,
    IonicPageModule.forChild(CheckinBadgesComponent),
  ],
  exports: [
    CheckinBadgesComponent
  ]
})
export class CheckinBadgesModule {}
