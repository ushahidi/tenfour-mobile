import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SigninPage } from './signin';

import { SigninUrlPage } from '../../pages/signin-url/signin-url';
import { SigninUrlModule } from '../../pages/signin-url/signin-url.module';

import { CheckinCardModule } from '../../components/checkin-card/checkin-card.module';

@NgModule({
  declarations: [
    SigninPage
  ],
  imports: [
    SigninUrlModule,
    CheckinCardModule,
    IonicPageModule.forChild(SigninPage)
  ],
  exports: [
    SigninPage
  ],
  entryComponents: [
    SigninPage
  ]
})
export class SigninModule {}
