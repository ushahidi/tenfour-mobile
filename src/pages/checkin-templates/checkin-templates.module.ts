import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { HumanizeModule } from '../../pipes/humanize/humanize.module';
import { CheckinSendModule } from '../../pages/checkin-send/checkin-send.module';

import { CheckinTemplatesPage } from './checkin-templates';

@NgModule({
  declarations: [
    CheckinTemplatesPage,
  ],
  imports: [
    HumanizeModule,
    IonicPageModule.forChild(CheckinTemplatesPage),
  ],
  exports: [
    CheckinTemplatesPage
  ],
  entryComponents: [
    CheckinTemplatesPage
  ]
})
export class CheckinTemplatesModule {}
