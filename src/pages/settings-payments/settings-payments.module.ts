import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SettingsPlanFreePageModule } from '../../pages/settings-plan-free/settings-plan-free.module';
import { SettingsPlanProPageModule } from '../../pages/settings-plan-pro/settings-plan-pro.module';
import { SettingsPlanProWelcomePageModule } from '../../pages/settings-plan-pro-welcome/settings-plan-pro-welcome.module';
import { SettingsCreditsPageModule } from '../../pages/settings-credits/settings-credits.module';

import { SettingsPaymentsPage } from './settings-payments';

import { DayOfMonthModule } from '../../pipes/day-of-month/day-of-month.module';

@NgModule({
  declarations: [
    SettingsPaymentsPage,
  ],
  imports: [
    DayOfMonthModule,
    SettingsPlanFreePageModule,
    SettingsPlanProPageModule,
    SettingsPlanProWelcomePageModule,
    SettingsCreditsPageModule,
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
