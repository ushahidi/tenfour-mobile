import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { AlertAutomaticSetupPage } from './alert-automatic-setup';

import { CheckinSendModule } from '../../pages/checkin-send/checkin-send.module';

import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';
import { HumanizeModule } from '../../pipes/humanize/humanize.module';

@NgModule({
  declarations: [
    AlertAutomaticSetupPage
  ],
  imports: [
    HumanizeModule,
    PersonAvatarModule,
    CheckinSendModule,
    IonicPageModule.forChild(AlertAutomaticSetupPage)
  ],
  exports: [
    AlertAutomaticSetupPage
  ],
  entryComponents: [
    AlertAutomaticSetupPage
  ]
})
export class AlertAutomaticSetupModule {}
