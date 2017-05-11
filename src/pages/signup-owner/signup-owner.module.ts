import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SignupOwnerPage } from './signup-owner';

@NgModule({
  declarations: [
    SignupOwnerPage,
  ],
  imports: [
    IonicPageModule.forChild(SignupOwnerPage),
  ],
  exports: [
    SignupOwnerPage
  ]
})
export class SignupOwnerModule {}
