import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CheckinSendPage } from './checkin-send';

import { CheckinAnswersModule } from '../../pages/checkin-answers/checkin-answers.module';
import { CheckinChannelsModule } from '../../pages/checkin-channels/checkin-channels.module';
import { PersonSelectModule } from '../../pages/person-select/person-select.module';

import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';
import { SendViaModule } from '../../components/send-via/send-via.module';
import { HumanizeModule } from '../../pipes/humanize/humanize.module';

@NgModule({
  declarations: [
    CheckinSendPage
  ],
  imports: [
    SendViaModule,
    HumanizeModule,
    PersonAvatarModule,
    PersonSelectModule,
    CheckinAnswersModule,
    IonicPageModule.forChild(CheckinSendPage)
  ],
  exports: [
    CheckinSendPage
  ],
  entryComponents: [
    CheckinSendPage
  ]
})
export class CheckinSendModule {}
