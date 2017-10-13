import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RollcallSendPage } from './rollcall-send';

import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';
import { SendViaModule } from '../../components/send-via/send-via.module';

@NgModule({
  declarations: [
    RollcallSendPage,
  ],
  imports: [
    SendViaModule,
    PersonAvatarModule,
    IonicPageModule.forChild(RollcallSendPage),
  ],
  exports: [
    RollcallSendPage
  ]
})
export class RollcallSendModule {}
