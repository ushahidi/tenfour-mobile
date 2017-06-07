import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RollcallEditPage } from './rollcall-edit';

import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    RollcallEditPage,
  ],
  imports: [
    PersonAvatarModule,
    IonicPageModule.forChild(RollcallEditPage),
  ],
  exports: [
    RollcallEditPage
  ]
})
export class RollcallEditModule {}
