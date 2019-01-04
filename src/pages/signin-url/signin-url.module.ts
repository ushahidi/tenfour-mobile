import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SigninUrlPage } from './signin-url';

import { SignupEmailPage } from '../../pages/signup-email/signup-email';
import { SignupEmailModule } from '../../pages/signup-email/signup-email.module';

import { SigninLookupPage } from '../../pages/signin-lookup/signin-lookup';
import { SigninLookupModule } from '../../pages/signin-lookup/signin-lookup.module';

@NgModule({
  declarations: [
    SigninUrlPage
  ],
  imports: [
    SignupEmailModule,
    SigninLookupModule,
    IonicPageModule.forChild(SigninUrlPage)
  ],
  exports: [
    SigninUrlPage
  ],
  entryComponents: [
    SigninUrlPage,
    SigninLookupPage
  ]
})
export class SigninUrlModule {}
