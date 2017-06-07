import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RollcallListPage } from './rollcall-list';

import { DateTimeModule } from '../../pipes/date-time.module';
import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    RollcallListPage,
  ],
  imports: [
    DateTimeModule,
    PersonAvatarModule,
    IonicPageModule.forChild(RollcallListPage),
  ],
  exports: [
    RollcallListPage
  ]
})
export class RollcallListModule {}
