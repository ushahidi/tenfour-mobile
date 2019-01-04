import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CheckinEditPage } from './checkin-edit';

import { CheckinSendModule } from '../../pages/checkin-send/checkin-send.module';

import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    CheckinEditPage
  ],
  imports: [
    PersonAvatarModule,
    CheckinSendModule,
    IonicPageModule.forChild(CheckinEditPage)
  ],
  exports: [
    CheckinEditPage
  ],
  entryComponents: [
    CheckinEditPage
  ]
})
export class CheckinEditModule {}
