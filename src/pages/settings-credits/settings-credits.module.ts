import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingsCreditsPage } from './settings-credits';

@NgModule({
  declarations: [
    SettingsCreditsPage,
  ],
  imports: [
    IonicPageModule.forChild(SettingsCreditsPage),
  ],
})
export class SettingsCreditsPageModule {}
