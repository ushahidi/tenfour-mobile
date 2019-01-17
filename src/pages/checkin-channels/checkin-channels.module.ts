import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CheckinChannelsPage } from './checkin-channels';

@NgModule({
  declarations: [
    CheckinChannelsPage,
  ],
  imports: [
    IonicPageModule.forChild(CheckinChannelsPage),
  ],
  exports: [
    CheckinChannelsPage
  ],
  entryComponents: [
    CheckinChannelsPage
  ]
})
export class CheckinChannelsModule {}
