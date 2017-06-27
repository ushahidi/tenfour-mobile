import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingsPaymentsPage } from './settings-payments';

@NgModule({
  declarations: [
    SettingsPaymentsPage,
  ],
  imports: [
    IonicPageModule.forChild(SettingsPaymentsPage),
  ],
  exports: [
    SettingsPaymentsPage
  ]
})
export class SettingsPaymentsModule {}
