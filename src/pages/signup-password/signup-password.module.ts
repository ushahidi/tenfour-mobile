import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SignupPasswordPage } from './signup-password';

import { OnboardListModule } from '../../pages/onboard-list/onboard-list.module';

@NgModule({
  declarations: [
    SignupPasswordPage,
  ],
  imports: [
    OnboardListModule,
    IonicPageModule.forChild(SignupPasswordPage),
  ],
  exports: [
    SignupPasswordPage
  ],
  entryComponents: [
    SignupPasswordPage
  ]
})
export class SignupPasswordModule {}
