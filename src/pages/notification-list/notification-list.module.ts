import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NotificationListPage } from './notification-list';

import { DateTimeModule } from '../../pipes/date-time/date-time.module';
import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';
import { OrganizationLogoModule } from '../../components/organization-logo/organization-logo.module';

@NgModule({
  declarations: [
    NotificationListPage
  ],
  imports: [
    DateTimeModule,
    PersonAvatarModule,
    OrganizationLogoModule,
    IonicPageModule.forChild(NotificationListPage)
  ],
  exports: [
    NotificationListPage
  ],
  entryComponents: [
    NotificationListPage
  ]
})
export class NotificationListModule {}
