import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingsRegionsPage } from './settings-regions';

@NgModule({
  declarations: [
    SettingsRegionsPage,
  ],
  imports: [
    IonicPageModule.forChild(SettingsRegionsPage),
  ],
  exports: [
    SettingsRegionsPage
  ]
})
export class SettingsRegionsModule {}
