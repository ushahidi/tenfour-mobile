import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CheckinDetailsPage } from './checkin-details';

import { DateTimeModule } from '../../pipes/date-time/date-time.module';
import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    CheckinDetailsPage,
  ],
  imports: [
    DateTimeModule,
    PersonAvatarModule,
    IonicPageModule.forChild(CheckinDetailsPage),
  ],
  exports: [
    CheckinDetailsPage
  ]
})
export class ReplyListModule {}
