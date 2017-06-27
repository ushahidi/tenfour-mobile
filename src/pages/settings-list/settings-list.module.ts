import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingsListPage } from './settings-list';

import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    SettingsListPage,
  ],
  imports: [
    PersonAvatarModule,
    IonicPageModule.forChild(SettingsListPage),
  ],
  exports: [
    SettingsListPage
  ]
})
export class SettingsListModule {}
