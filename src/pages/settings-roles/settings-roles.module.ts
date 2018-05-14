import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SettingsRolesPage } from './settings-roles';

@NgModule({
  declarations: [
    SettingsRolesPage,
  ],
  imports: [
    IonicPageModule.forChild(SettingsRolesPage),
  ],
  exports: [
    SettingsRolesPage
  ],
  entryComponents: [
    SettingsRolesPage
  ]
})
export class SettingsRolesModule {}
