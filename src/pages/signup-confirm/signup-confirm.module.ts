import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SignupConfirmPage } from './signup-confirm';

@NgModule({
  declarations: [
    SignupConfirmPage,
  ],
  imports: [
    IonicPageModule.forChild(SignupConfirmPage),
  ],
  exports: [
    SignupConfirmPage
  ]
})
export class SignupConfirmModule {}
