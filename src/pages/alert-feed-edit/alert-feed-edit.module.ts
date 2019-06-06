import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { AlertFeedEditPage } from './alert-feed-edit';

@NgModule({
  declarations: [
    AlertFeedEditPage
  ],
  imports: [
    IonicPageModule.forChild(AlertFeedEditPage)
  ],
  exports: [
    AlertFeedEditPage
  ],
  entryComponents: [
    AlertFeedEditPage
  ]
})
export class AlertFeedEditModule {}
