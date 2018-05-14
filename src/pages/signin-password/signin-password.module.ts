import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SigninPasswordPage } from './signin-password';

import { CheckinListModule } from '../../pages/checkin-list/checkin-list.module';
import { OnboardListModule } from '../../pages/onboard-list/onboard-list.module';

@NgModule({
  declarations: [
    SigninPasswordPage,
  ],
  imports: [
    CheckinListModule,
    OnboardListModule,
    IonicPageModule.forChild(SigninPasswordPage),
  ],
  exports: [
    SigninPasswordPage
  ],
  entryComponents: [
    SigninPasswordPage
  ]
})
export class SigninPasswordModule {}
