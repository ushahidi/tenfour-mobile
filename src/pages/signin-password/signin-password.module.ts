import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SigninPasswordPage } from './signin-password';

@NgModule({
  declarations: [
    SigninPasswordPage,
  ],
  imports: [
    IonicPageModule.forChild(SigninPasswordPage),
  ],
  exports: [
    SigninPasswordPage
  ]
})
export class SigninPasswordModule {}
