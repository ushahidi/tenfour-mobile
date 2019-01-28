import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { PersonProfilePage } from './person-profile';

import { PersonEditModule } from '../../pages/person-edit/person-edit.module';
import { CheckinDetailsModule } from '../../pages/checkin-details/checkin-details.module';

import { DateTimeModule } from '../../pipes/date-time/date-time.module';
import { TitleizeModule } from '../../pipes/titleize/titleize.module';
import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';
import { CheckinCardModule } from '../../components/checkin-card/checkin-card.module';
import { CheckinReplyModule } from '../../components/checkin-reply/checkin-reply.module';

@NgModule({
  declarations: [
    PersonProfilePage
  ],
  imports: [
    DateTimeModule,
    TitleizeModule,
    PersonAvatarModule,
    CheckinCardModule,
    PersonEditModule,
    CheckinDetailsModule,
    CheckinReplyModule,
    IonicPageModule.forChild(PersonProfilePage)
  ],
  exports: [
    PersonProfilePage
  ],
  entryComponents: [
    PersonProfilePage
  ]
})
export class PersonProfileModule {}
