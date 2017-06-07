import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReplySendPage } from './reply-send';

import { DateTimeModule } from '../../pipes/date-time.module';
import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    ReplySendPage,
  ],
  imports: [
    PersonAvatarModule,
    DateTimeModule,
    IonicPageModule.forChild(ReplySendPage),
  ],
  exports: [
    ReplySendPage
  ]
})
export class ReplySendModule {}
