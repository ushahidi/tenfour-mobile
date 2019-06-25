import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SignupPage } from './signup';

import { SignupEmailPage } from '../../pages/signup-email/signup-email';
import { SignupEmailModule } from '../../pages/signup-email/signup-email.module';

import { CheckinCardModule } from '../../components/checkin-card/checkin-card.module';

@NgModule({
  declarations: [
    SignupPage
  ],
  imports: [
    SignupEmailModule,
    CheckinCardModule,
    IonicPageModule.forChild(SignupPage)
  ],
  exports: [
    SignupPage
  ],
  entryComponents: [
    SignupPage
  ]
})
export class SignupModule {}
