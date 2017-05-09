import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SigninEmailPage } from './signin-email';

@NgModule({
  declarations: [
    SigninEmailPage,
  ],
  imports: [
    IonicPageModule.forChild(SigninEmailPage),
  ],
  exports: [
    SigninEmailPage
  ]
})
export class SigninEmailModule {}
