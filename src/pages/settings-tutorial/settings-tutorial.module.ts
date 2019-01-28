import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SettingsTutorialPage } from './settings-tutorial';

import { CheckinTestModule } from '../../pages/checkin-test/checkin-test.module';
import { CheckinListModule } from '../../pages/checkin-list/checkin-list.module';

@NgModule({
  declarations: [
    SettingsTutorialPage
  ],
  imports: [
    CheckinTestModule,
    CheckinListModule,
    IonicPageModule.forChild(SettingsTutorialPage)
  ],
  exports: [
    SettingsTutorialPage
  ],
  entryComponents: [
    SettingsTutorialPage
  ]
})
export class SettingsTutorialModule {}
