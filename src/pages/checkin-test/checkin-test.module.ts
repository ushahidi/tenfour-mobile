import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CheckinTestPage } from './checkin-test';

import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    CheckinTestPage,
  ],
  imports: [
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
