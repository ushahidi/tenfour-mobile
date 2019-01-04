import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CheckinAnswersPage } from './checkin-answers';

@NgModule({
  declarations: [
    CheckinAnswersPage
  ],
  imports: [
    IonicPageModule.forChild(CheckinAnswersPage)
  ],
  exports: [
    CheckinAnswersPage
  ],
  entryComponents: [
    CheckinAnswersPage
  ]
})
export class CheckinAnswersModule {}
