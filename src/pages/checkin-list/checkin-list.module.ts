import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CheckinListPage } from './checkin-list';
import { CheckinDetailsModule } from '../../pages/checkin-details/checkin-details.module';
import { CheckinEditModule } from '../../pages/checkin-edit/checkin-edit.module';
import { CheckinRespondModule } from '../../pages/checkin-respond/checkin-respond.module';
import { NotificationListModule } from '../../pages/notification-list/notification-list.module';

import { DateTimeModule } from '../../pipes/date-time/date-time.module';
import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';
import { CheckinCardModule } from '../../components/checkin-card/checkin-card.module';

@NgModule({
  declarations: [
    CheckinListPage
  ],
  imports: [
    DateTimeModule,
    PersonAvatarModule,
    CheckinCardModule,
    CheckinEditModule,
    CheckinRespondModule,
    CheckinDetailsModule,
    NotificationListModule,
    IonicPageModule.forChild(CheckinListPage)
  ],
  exports: [
    CheckinListPage
  ],
  entryComponents: [
    CheckinListPage
  ]
})
export class CheckinListModule {}
