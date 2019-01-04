import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SettingsSizesPage } from './settings-sizes';

@NgModule({
  declarations: [
    SettingsSizesPage
  ],
  imports: [
    IonicPageModule.forChild(SettingsSizesPage)
  ],
  exports: [
    SettingsSizesPage
  ],
  entryComponents: [
    SettingsSizesPage
  ]
})
export class SettingsSizesModule {}
