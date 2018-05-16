import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CheckinDetailsComponent } from './checkin-details';

import { DateTimeModule } from '../../pipes/date-time/date-time.module';
import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    CheckinDetailsComponent,
  ],
  imports: [
    DateTimeModule,
    PersonAvatarModule,
    IonicPageModule.forChild(CheckinDetailsComponent),
  ],
  exports: [
    CheckinDetailsComponent
  ]
})
export class CheckinDetailModule {}
