import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SignupNamePage } from './signup-name';

@NgModule({
  declarations: [
    SignupNamePage,
  ],
  imports: [
    IonicPageModule.forChild(SignupNamePage),
  ],
  exports: [
    SignupNamePage
  ]
})
export class SignupNameModule {}
