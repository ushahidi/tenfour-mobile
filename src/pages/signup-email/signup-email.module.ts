import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SignupEmailPage } from './signup-email';

import { SignupCheckModule } from '../../pages/signup-check/signup-check.module';

@NgModule({
  declarations: [
    SignupEmailPage,
  ],
  imports: [
    SignupCheckModule,
    IonicPageModule.forChild(SignupEmailPage),
  ],
  exports: [
    SignupEmailPage
  ],
  entryComponents: [
    SignupEmailPage
  ]
})
export class SignupEmailModule {}
