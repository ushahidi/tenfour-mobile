import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SignupUrlPage } from './signup-url';

import { SignupPlanModule } from '../../pages/signup-plan/signup-plan.module';

@NgModule({
  declarations: [
    SignupUrlPage,
  ],
  imports: [
    SignupPlanModule,
    IonicPageModule.forChild(SignupUrlPage),
  ],
  exports: [
    SignupUrlPage
  ],
  entryComponents: [
    SignupUrlPage
  ]
})
export class SignupUrlModule {}
