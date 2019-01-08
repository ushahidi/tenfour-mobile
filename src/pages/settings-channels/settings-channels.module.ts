import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SettingsChannelsPage } from './settings-channels';

@NgModule({
  declarations: [
    SettingsChannelsPage
  ],
  imports: [
    IonicPageModule.forChild(SettingsChannelsPage)
  ],
  exports: [
    SettingsChannelsPage
  ],
  entryComponents: [
    SettingsChannelsPage
  ]
})
export class SettingsChannelsModule {}
