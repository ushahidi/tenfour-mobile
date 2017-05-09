import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SignupPlanPage } from './signup-plan';

@NgModule({
  declarations: [
    SignupPlanPage,
  ],
  imports: [
    IonicPageModule.forChild(SignupPlanPage),
  ],
  exports: [
    SignupPlanPage
  ]
})
export class SignupPlanModule {}
