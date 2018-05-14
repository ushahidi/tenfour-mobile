import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SettingsRegionsPage } from './settings-regions';

import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    SettingsRegionsPage,
  ],
  imports: [
    PersonAvatarModule,
    IonicPageModule.forChild(SettingsRegionsPage),
  ],
  exports: [
    SettingsRegionsPage
  ],
  entryComponents: [
    SettingsRegionsPage
  ]
})
export class SettingsRegionsModule {}
