import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingsPlanProWelcomePage } from './settings-plan-pro-welcome';

import { DateTimeModule } from '../../pipes/date-time/date-time.module';

@NgModule({
  declarations: [
    SettingsPlanProWelcomePage,
  ],
  imports: [
    DateTimeModule,
    IonicPageModule.forChild(SettingsPlanProWelcomePage),
  ],
})
export class SettingsPlanProWelcomePageModule {}
