import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { AlertCheckinEditPage } from './alert-checkin-edit';

import { CheckinSendModule } from '../../pages/checkin-send/checkin-send.module';

import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    AlertCheckinEditPage
  ],
  imports: [
    PersonAvatarModule,
    CheckinSendModule,
    IonicPageModule.forChild(AlertCheckinEditPage)
  ],
  exports: [
    AlertCheckinEditPage
  ],
  entryComponents: [
    AlertCheckinEditPage
  ]
})
export class AlertCheckinEditModule {}
