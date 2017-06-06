import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NotificationListPage } from './notification-list';

@NgModule({
  declarations: [
    NotificationListPage,
  ],
  imports: [
    IonicPageModule.forChild(NotificationListPage),
  ],
  exports: [
    NotificationListPage
  ]
})
export class NotificationListModule {}
