import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SignupDetailsPage } from './signup-details';

import { SignupPasswordModule } from '../../pages/signup-password/signup-password.module';


@NgModule({
  declarations: [
    SignupDetailsPage,
  ],
  imports: [
    SignupPasswordModule,
    IonicPageModule.forChild(SignupDetailsPage),
  ],
  exports: [
    SignupDetailsPage
  ],
  entryComponents: [
    SignupDetailsPage
  ]
})
export class SignupDetailsModule {}
