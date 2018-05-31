import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SigninInvitePage } from './signin-invite';

@NgModule({
  declarations: [
    SigninInvitePage,
  ],
  imports: [
    IonicPageModule.forChild(SigninInvitePage),
  ],
  exports: [
    SigninInvitePage
  ],
  entryComponents: [
    SigninInvitePage
  ]
})
export class SigninInviteModule {}
