import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CheckinTestPage } from './checkin-test';

import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';
import { HumanizeModule } from '../../pipes/humanize/humanize.module';

@NgModule({
  declarations: [
    CheckinTestPage,
  ],
  imports: [
    HumanizeModule,
    PersonAvatarModule,
    IonicPageModule.forChild(CheckinTestPage),
  ],
  exports: [
    CheckinTestPage
  ],
  entryComponents: [
    CheckinTestPage
  ]
})
export class CheckinTestModule {}
