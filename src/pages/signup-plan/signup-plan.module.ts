import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SignupPlanPage } from './signup-plan';

import { SignupPaymentModule } from '../../pages/signup-payment/signup-payment.module';
import { SignupPasswordModule } from '../../pages/signup-password/signup-password.module';

@NgModule({
  declarations: [
    SignupPlanPage
  ],
  imports: [
    SignupPaymentModule,
    SignupPasswordModule,
    IonicPageModule.forChild(SignupPlanPage)
  ],
  exports: [
    SignupPlanPage
  ],
  entryComponents: [
    SignupPlanPage
  ]
})
export class SignupPlanModule {}
