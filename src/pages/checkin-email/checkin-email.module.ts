import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CheckinEmailPage } from './checkin-email';

import { DateTimeModule } from '../../pipes/date-time/date-time.module';
import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';
import { CheckinRespondComponentModule } from '../../components/checkin-respond/checkin-respond.module';

@NgModule({
  declarations: [
    CheckinEmailPage,
  ],
  imports: [
    DateTimeModule,
    PersonAvatarModule,
    CheckinRespondComponentModule,
    IonicPageModule.forChild(CheckinEmailPage),
  ],
  exports: [
    CheckinEmailPage
  ],
  entryComponents: [
    CheckinEmailPage
  ]
})
export class CheckinEmailModule {}
