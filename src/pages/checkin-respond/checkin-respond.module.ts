import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CheckinRespondPage } from './checkin-respond';

import { DateTimeModule } from '../../pipes/date-time/date-time.module';
import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';
import { CheckinRespondComponentModule } from '../../components/checkin-respond/checkin-respond.module';

@NgModule({
  declarations: [
    CheckinRespondPage
  ],
  imports: [
    PersonAvatarModule,
    DateTimeModule,
    CheckinRespondComponentModule,
    IonicPageModule.forChild(CheckinRespondPage)
  ],
  exports: [
    CheckinRespondPage
  ],
  entryComponents: [
    CheckinRespondPage
  ]
})
export class CheckinRespondModule {}
