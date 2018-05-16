import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CheckinDetailsPage } from './checkin-details';
import { CheckinRespondModule } from '../../pages/checkin-respond/checkin-respond.module';

import { DateTimeModule } from '../../pipes/date-time/date-time.module';
import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';
import { CheckinDetailModule } from '../../components/checkin-details/checkin-details.module';

@NgModule({
  declarations: [
    CheckinDetailsPage,
  ],
  imports: [
    DateTimeModule,
    PersonAvatarModule,
    CheckinRespondModule,
    CheckinDetailModule,
    IonicPageModule.forChild(CheckinDetailsPage),
  ],
  exports: [
    CheckinDetailsPage
  ],
  entryComponents: [
    CheckinDetailsPage
  ]
})
export class CheckinDetailsModule {}
