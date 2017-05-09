import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SignupUrlPage } from './signup-url';

@NgModule({
  declarations: [
    SignupUrlPage,
  ],
  imports: [
    IonicPageModule.forChild(SignupUrlPage),
  ],
  exports: [
    SignupUrlPage
  ]
})
export class SignupUrlModule {}
