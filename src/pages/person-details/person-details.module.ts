import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { PersonDetailsPage } from './person-details';

import { PersonEditModule } from '../../pages/person-edit/person-edit.module';
import { CheckinDetailsModule } from '../../pages/checkin-details/checkin-details.module';

import { DateTimeModule } from '../../pipes/date-time/date-time.module';
import { TitleizeModule } from '../../pipes/titleize/titleize.module';
import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';
import { CheckinCardModule } from '../../components/checkin-card/checkin-card.module';

@NgModule({
  declarations: [
    PersonDetailsPage,
  ],
  imports: [
    DateTimeModule,
    TitleizeModule,
    PersonAvatarModule,
    CheckinCardModule,
    PersonEditModule,
    CheckinDetailsModule,
    IonicPageModule.forChild(PersonDetailsPage),
  ],
  exports: [
    PersonDetailsPage
  ],
  entryComponents: [
    PersonDetailsPage
  ]
})
export class PersonDetailsModule {}
