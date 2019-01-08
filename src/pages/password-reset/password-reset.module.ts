import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { PasswordResetPage } from './password-reset';

import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    PasswordResetPage
  ],
  imports: [
    PersonAvatarModule,
    IonicPageModule.forChild(PasswordResetPage)
  ],
  exports: [
    PasswordResetPage
  ],
  entryComponents: [
    PasswordResetPage
  ]
})
export class PasswordResetModule {}
