import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CheckinReplyComponent } from './checkin-reply';

import { DateTimeModule } from '../../pipes/date-time/date-time.module';
import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    CheckinReplyComponent
  ],
  imports: [
    DateTimeModule,
    PersonAvatarModule,
    IonicPageModule.forChild(CheckinReplyComponent)
  ],
  exports: [
    CheckinReplyComponent
  ]
})
export class CheckinReplyModule {}
