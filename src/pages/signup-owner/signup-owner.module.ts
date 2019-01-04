import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SignupOwnerPage } from './signup-owner';

import { SignupNameModule } from '../../pages/signup-name/signup-name.module';

@NgModule({
  declarations: [
    SignupOwnerPage
  ],
  imports: [
    SignupNameModule,
    IonicPageModule.forChild(SignupOwnerPage)
  ],
  exports: [
    SignupOwnerPage
  ],
  entryComponents: [
    SignupOwnerPage
  ]
})
export class SignupOwnerModule {}
