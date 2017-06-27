import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingsEditPage } from './settings-edit';

import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    SettingsEditPage,
  ],
  imports: [
    PersonAvatarModule,
    IonicPageModule.forChild(SettingsEditPage),
  ],
  exports: [
    SettingsEditPage
  ]
})
export class SettingsEditModule {}
