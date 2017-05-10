import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SignupEmailPage } from './signup-email';

@NgModule({
  declarations: [
    SignupEmailPage,
  ],
  imports: [
    IonicPageModule.forChild(SignupEmailPage),
  ],
  exports: [
    SignupEmailPage
  ]
})
export class SignupEmailModule {}
