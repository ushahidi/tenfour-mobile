import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RollcallPeoplePage } from './rollcall-people';

import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    RollcallPeoplePage,
  ],
  imports: [
    PersonAvatarModule,
    IonicPageModule.forChild(RollcallPeoplePage),
  ],
  exports: [
    RollcallPeoplePage
  ]
})
export class RollcallPeopleModule {}
