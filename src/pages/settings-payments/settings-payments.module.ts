import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SettingsSwitchtofreePageModule } from '../../pages/settings-switchtofree/settings-switchtofree.module';
import { SettingsSwitchtoproPageModule } from '../../pages/settings-switchtopro/settings-switchtopro.module';
import { SettingsWelcometoproPageModule } from '../../pages/settings-welcometopro/settings-welcometopro.module';

import { SettingsPaymentsPage } from './settings-payments';

@NgModule({
  declarations: [
    SettingsPaymentsPage,
  ],
  imports: [
    SettingsSwitchtofreePageModule,
    SettingsSwitchtoproPageModule,
    SettingsWelcometoproPageModule,
    IonicPageModule.forChild(SettingsPaymentsPage),
  ],
  exports: [
    SettingsPaymentsPage
  ],
  entryComponents: [
    SettingsPaymentsPage
  ]
})
export class SettingsPaymentsModule {}
