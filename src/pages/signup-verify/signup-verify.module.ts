import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SignupVerifyPage } from './signup-verify';

@NgModule({
  declarations: [
    SignupVerifyPage,
  ],
  imports: [
    IonicPageModule.forChild(SignupVerifyPage),
  ],
  exports: [
    SignupVerifyPage
  ],
  entryComponents: [
    SignupVerifyPage
  ]
})
export class SignupVerifyModule {}
