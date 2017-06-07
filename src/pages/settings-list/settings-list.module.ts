import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingsListPage } from './settings-list';

@NgModule({
  declarations: [
    SettingsListPage,
  ],
  imports: [
    IonicPageModule.forChild(SettingsListPage),
  ],
  exports: [
    SettingsListPage
  ]
})
export class SettingsListModule {}
