import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CheckinRespondComponent } from './checkin-respond';

import { DateTimeModule } from '../../pipes/date-time/date-time.module';
import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    CheckinRespondComponent,
  ],
  imports: [
    DateTimeModule,
    PersonAvatarModule,
    IonicPageModule.forChild(CheckinRespondComponent),
  ],
  exports: [
    CheckinRespondComponent
  ]
})
export class CheckinRespondComponentModule {}
