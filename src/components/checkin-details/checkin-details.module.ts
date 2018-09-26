import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CheckinDetailsComponent } from './checkin-details';

import { DateTimeModule } from '../../pipes/date-time/date-time.module';
import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';
import { CheckinReplyModule } from '../../components/checkin-reply/checkin-reply.module';
import { CheckinBadgesModule } from '../../components/checkin-badges/checkin-badges.module';

@NgModule({
  declarations: [
    CheckinDetailsComponent,
  ],
  imports: [
    DateTimeModule,
    PersonAvatarModule,
    CheckinReplyModule,
    CheckinBadgesModule,
    IonicPageModule.forChild(CheckinDetailsComponent),
  ],
  exports: [
    CheckinDetailsComponent
  ]
})
export class CheckinDetailModule {}
