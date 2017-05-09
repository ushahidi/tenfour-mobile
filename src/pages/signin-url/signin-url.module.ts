import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SigninUrlPage } from './signin-url';

@NgModule({
  declarations: [
    SigninUrlPage,
  ],
  imports: [
    IonicPageModule.forChild(SigninUrlPage),
  ],
  exports: [
    SigninUrlPage
  ]
})
export class SignupUrlModule {}
