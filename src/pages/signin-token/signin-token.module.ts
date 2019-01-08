import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SigninTokenPage } from './signin-token';

import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    SigninTokenPage
  ],
  imports: [
    PersonAvatarModule,
    IonicPageModule.forChild(SigninTokenPage)
  ],
  exports: [
    SigninTokenPage
  ],
  entryComponents: [
    SigninTokenPage
  ]
})
export class SigninTokenModule {}
