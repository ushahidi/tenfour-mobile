import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SigninInvitePage } from './signin-invite';

import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    SigninInvitePage
  ],
  imports: [
    PersonAvatarModule,
    IonicPageModule.forChild(SigninInvitePage)
  ],
  exports: [
    SigninInvitePage
  ],
  entryComponents: [
    SigninInvitePage
  ]
})
export class SigninInviteModule {}
