import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SignupUrlPage } from './signup-url';

import { SignupPasswordModule } from '../../pages/signup-password/signup-password.module';

@NgModule({
  declarations: [
    SignupUrlPage
  ],
  imports: [
    SignupPasswordModule,
    IonicPageModule.forChild(SignupUrlPage)
  ],
  exports: [
    SignupUrlPage
  ],
  entryComponents: [
    SignupUrlPage
  ]
})
export class SignupUrlModule {}
