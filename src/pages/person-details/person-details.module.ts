import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PersonDetailsPage } from './person-details';

import { DateTimeModule } from '../../pipes/date-time/date-time.module';
import { TitleizeModule } from '../../pipes/titleize/titleize.module';
import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    PersonDetailsPage,
  ],
  imports: [
    DateTimeModule,
    TitleizeModule,
    PersonAvatarModule,
    IonicPageModule.forChild(PersonDetailsPage),
  ],
  exports: [
    PersonDetailsPage
  ]
})
export class PersonDetailsModule {}
