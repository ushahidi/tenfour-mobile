import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SignupPaymentPage } from './signup-payment';

import { SignupPasswordModule } from '../../pages/signup-password/signup-password.module';

@NgModule({
  declarations: [
    SignupPaymentPage,
  ],
  imports: [
    SignupPasswordModule,
    IonicPageModule.forChild(SignupPaymentPage),
  ],
  exports: [
    SignupPaymentPage
  ],
  entryComponents: [
    SignupPaymentPage
  ]
})
export class SignupPaymentModule {}
