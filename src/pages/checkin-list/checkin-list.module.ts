import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CheckinListPage } from './checkin-list';

import { DateTimeModule } from '../../pipes/date-time/date-time.module';
import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';
import { CheckinCardModule } from '../../components/checkin-card/checkin-card.module';

@NgModule({
  declarations: [
    CheckinListPage,
  ],
  imports: [
    DateTimeModule,
    PersonAvatarModule,
    CheckinCardModule,
    IonicPageModule.forChild(CheckinListPage),
  ],
  exports: [
    CheckinListPage
  ]
})
export class CheckinListModule {}
