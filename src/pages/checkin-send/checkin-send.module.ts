import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CheckinSendPage } from './checkin-send';

import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';
import { SendViaModule } from '../../components/send-via/send-via.module';
import { HumanizeModule } from '../../pipes/humanize/humanize.module';

@NgModule({
  declarations: [
    CheckinSendPage,
  ],
  imports: [
    SendViaModule,
    HumanizeModule,
    PersonAvatarModule,
    IonicPageModule.forChild(CheckinSendPage),
  ],
  exports: [
    CheckinSendPage
  ]
})
export class CheckinSendModule {}
