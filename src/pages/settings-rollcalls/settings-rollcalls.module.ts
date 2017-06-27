import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingsRollcallsPage } from './settings-rollcalls';

@NgModule({
  declarations: [
    SettingsRollcallsPage,
  ],
  imports: [
    IonicPageModule.forChild(SettingsRollcallsPage),
  ],
  exports: [
    SettingsRollcallsPage
  ]
})
export class SettingsRollcallsModule {}
