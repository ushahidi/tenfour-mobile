import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CheckinEmailPage } from './checkin-email';
import { CheckinRespondModule } from '../../pages/checkin-respond/checkin-respond.module';

@NgModule({
  declarations: [
    CheckinEmailPage,
  ],
  imports: [
    CheckinRespondModule,
    IonicPageModule.forChild(CheckinEmailPage),
  ],
  exports: [
    CheckinEmailPage
  ],
  entryComponents: [
    CheckinEmailPage
  ]
})
export class CheckinEmailModule {}
