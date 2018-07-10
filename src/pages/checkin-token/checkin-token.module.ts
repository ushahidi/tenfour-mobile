import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CheckinTokenPage } from './checkin-token';

import { DateTimeModule } from '../../pipes/date-time/date-time.module';
import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';
import { CheckinRespondComponentModule } from '../../components/checkin-respond/checkin-respond.module';

@NgModule({
  declarations: [
    CheckinTokenPage,
  ],
  imports: [
    DateTimeModule,
    PersonAvatarModule,
    CheckinRespondComponentModule,
    IonicPageModule.forChild(CheckinTokenPage),
  ],
  exports: [
    CheckinTokenPage
  ],
  entryComponents: [
    CheckinTokenPage
  ]
})
export class CheckinTokenModule {}
