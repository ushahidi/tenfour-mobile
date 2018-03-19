import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingsCheckinsPage } from './settings-checkins';

@NgModule({
  declarations: [
    SettingsCheckinsPage,
  ],
  imports: [
    IonicPageModule.forChild(SettingsCheckinsPage),
  ],
  exports: [
    SettingsCheckinsPage
  ]
})
export class SettingsCheckinsModule {}
