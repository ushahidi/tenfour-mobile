import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReplyListPage } from './reply-list';

import { DateTimeModule } from '../../pipes/date-time.module';
import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    ReplyListPage,
  ],
  imports: [
    DateTimeModule,
    PersonAvatarModule,
    IonicPageModule.forChild(ReplyListPage),
  ],
  exports: [
    ReplyListPage
  ]
})
export class ReplyListModule {}
