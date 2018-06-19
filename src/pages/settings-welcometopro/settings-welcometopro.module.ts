import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingsWelcometoproPage } from './settings-welcometopro';

import { DateTimeModule } from '../../pipes/date-time/date-time.module';

@NgModule({
  declarations: [
    SettingsWelcometoproPage,
  ],
  imports: [
    DateTimeModule,
    IonicPageModule.forChild(SettingsWelcometoproPage),
  ],
})
export class SettingsWelcometoproPageModule {}
