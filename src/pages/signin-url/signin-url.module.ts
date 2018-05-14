import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SigninUrlPage } from './signin-url';

import { SigninEmailPage } from '../../pages/signin-email/signin-email';
import { SigninEmailModule } from '../../pages/signin-email/signin-email.module';

import { SignupEmailPage } from '../../pages/signup-email/signup-email';
import { SignupEmailModule } from '../../pages/signup-email/signup-email.module';

@NgModule({
  declarations: [
    SigninUrlPage,
  ],
  imports: [
    SigninEmailModule,
    SignupEmailModule,
    IonicPageModule.forChild(SigninUrlPage),
  ],
  exports: [
    SigninUrlPage
  ],
  entryComponents: [
    SigninUrlPage
  ]
})
export class SigninUrlModule {}
