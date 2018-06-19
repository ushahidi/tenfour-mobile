import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SettingsSwitchtofreePageModule } from '../../pages/settings-switchtofree/settings-switchtofree.module';
import { SettingsSwitchtoproPageModule } from '../../pages/settings-switchtopro/settings-switchtopro.module';
import { SettingsWelcometoproPageModule } from '../../pages/settings-welcometopro/settings-welcometopro.module';
import { SettingsAddcreditsPageModule } from '../../pages/settings-addcredits/settings-addcredits.module';

import { SettingsPaymentsPage } from './settings-payments';

import { DayOfMonthModule } from '../../pipes/day-of-month/day-of-month.module';

@NgModule({
  declarations: [
    SettingsPaymentsPage,
  ],
  imports: [
    DayOfMonthModule,
    SettingsSwitchtofreePageModule,
    SettingsSwitchtoproPageModule,
    SettingsWelcometoproPageModule,
    SettingsAddcreditsPageModule,
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
