import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { PersonEditPage } from './person-edit';

import { DateTimeModule } from '../../pipes/date-time/date-time.module';
import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';
import { PersonRowModule } from '../../components/person-row/person-row.module';

@NgModule({
  declarations: [
    PersonEditPage,
  ],
  imports: [
    DateTimeModule,
    PersonRowModule,
    PersonAvatarModule,
    IonicPageModule.forChild(PersonEditPage),
  ],
  exports: [
    PersonEditPage
  ],
  entryComponents: [
    PersonEditPage
  ]
})
export class PersonEditModule {}
