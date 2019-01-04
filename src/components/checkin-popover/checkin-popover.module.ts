import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CheckinPopoverComponent } from './checkin-popover';

@NgModule({
  declarations: [
    CheckinPopoverComponent
  ],
  imports: [
    IonicPageModule.forChild(CheckinPopoverComponent)
  ],
  exports: [
    CheckinPopoverComponent
  ]
})
export class CheckinPopoverModule {}
