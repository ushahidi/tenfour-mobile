import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CheckinActionsComponent } from './checkin-actions';

@NgModule({
  declarations: [
    CheckinActionsComponent,
  ],
  imports: [
    IonicPageModule.forChild(CheckinActionsComponent),
  ],
  exports: [
    CheckinActionsComponent
  ]
})
export class CheckinActionsModule {}
