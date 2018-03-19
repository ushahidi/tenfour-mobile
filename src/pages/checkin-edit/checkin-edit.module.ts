import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CheckinEditPage } from './checkin-edit';

import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    CheckinEditPage,
  ],
  imports: [
    PersonAvatarModule,
    IonicPageModule.forChild(CheckinEditPage),
  ],
  exports: [
    CheckinEditPage
  ]
})
export class CheckinEditModule {}
