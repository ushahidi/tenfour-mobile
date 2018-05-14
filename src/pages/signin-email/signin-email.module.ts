import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SigninEmailPage } from './signin-email';
import { SigninPasswordModule } from '../../pages/signin-password/signin-password.module';

@NgModule({
  declarations: [
    SigninEmailPage,
  ],
  imports: [
    SigninPasswordModule,
    IonicPageModule.forChild(SigninEmailPage),
  ],
  exports: [
    SigninEmailPage
  ],
  entryComponents: [
    SigninEmailPage
  ]
})
export class SigninEmailModule {}
