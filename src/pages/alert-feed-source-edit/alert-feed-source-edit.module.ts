import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { AlertFeedSourceEditPage } from './alert-feed-source-edit';

@NgModule({
  declarations: [
    AlertFeedSourceEditPage
  ],
  imports: [
    IonicPageModule.forChild(AlertFeedSourceEditPage)
  ],
  exports: [
    AlertFeedSourceEditPage
  ],
  entryComponents: [
    AlertFeedSourceEditPage
  ]
})
export class AlertFeedSourceEditModule {}
