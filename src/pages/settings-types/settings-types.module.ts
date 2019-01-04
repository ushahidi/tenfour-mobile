import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SettingsTypesPage } from './settings-types';

@NgModule({
  declarations: [
    SettingsTypesPage
  ],
  imports: [
    IonicPageModule.forChild(SettingsTypesPage)
  ],
  exports: [
    SettingsTypesPage
  ],
  entryComponents: [
    SettingsTypesPage
  ]
})
export class SettingsTypesModule {}
