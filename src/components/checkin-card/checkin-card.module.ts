import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CheckinCardComponent } from './checkin-card';

import { DateTimeModule } from '../../pipes/date-time/date-time.module';
import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';
import { CheckinBadgesModule } from '../../components/checkin-badges/checkin-badges.module';

@NgModule({
  declarations: [
    CheckinCardComponent
  ],
  imports: [
    DateTimeModule,
    PersonAvatarModule,
    CheckinBadgesModule,
    IonicPageModule.forChild(CheckinCardComponent)
  ],
  exports: [
    CheckinCardComponent
  ]
})
export class CheckinCardModule {}
