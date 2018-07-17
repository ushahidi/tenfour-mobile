import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingsCreditsPage } from './settings-credits';
import { DateTimeModule } from '../../pipes/date-time/date-time.module';

@NgModule({
  declarations: [
    SettingsCreditsPage,
  ],
  imports: [
    DateTimeModule,
    IonicPageModule.forChild(SettingsCreditsPage),
  ],
})
export class SettingsCreditsPageModule {}
