import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SignupCheckPage } from './signup-check';

@NgModule({
  declarations: [
    SignupCheckPage,
  ],
  imports: [
    IonicPageModule.forChild(SignupCheckPage),
  ],
  exports: [
    SignupCheckPage
  ]
})
export class SignupCheckModule {}
