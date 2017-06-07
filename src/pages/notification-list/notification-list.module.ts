import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NotificationListPage } from './notification-list';

import { DateTimeModule } from '../../pipes/date-time.module';
import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    NotificationListPage,
  ],
  imports: [
    DateTimeModule,
    PersonAvatarModule,
    IonicPageModule.forChild(NotificationListPage),
  ],
  exports: [
    NotificationListPage
  ]
})
export class NotificationListModule {}
