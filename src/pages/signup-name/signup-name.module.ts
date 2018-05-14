import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SignupNamePage } from './signup-name';

import { SignupUrlModule } from '../../pages/signup-url/signup-url.module';

@NgModule({
  declarations: [
    SignupNamePage,
  ],
  imports: [
    SignupUrlModule,
    IonicPageModule.forChild(SignupNamePage),
  ],
  exports: [
    SignupNamePage
  ],
  entryComponents: [
    SignupNamePage
  ]
})
export class SignupNameModule {}
