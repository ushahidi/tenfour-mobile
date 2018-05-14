import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SignupCheckPage } from './signup-check';

import { SignupOwnerModule } from '../../pages/signup-owner/signup-owner.module';

@NgModule({
  declarations: [
    SignupCheckPage,
  ],
  imports: [
    SignupOwnerModule,
    IonicPageModule.forChild(SignupCheckPage),
  ],
  exports: [
    SignupCheckPage
  ],
  entryComponents: [
    SignupCheckPage
  ]
})
export class SignupCheckModule {}
