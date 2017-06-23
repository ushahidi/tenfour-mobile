import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RollcallTestPage } from './rollcall-test';

import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    RollcallTestPage,
  ],
  imports: [
    PersonAvatarModule,
    IonicPageModule.forChild(RollcallTestPage),
  ],
  exports: [
    RollcallTestPage
  ]
})
export class RollcallTestModule {}
