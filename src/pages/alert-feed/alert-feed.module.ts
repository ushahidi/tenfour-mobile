import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { AlertFeedPage } from './alert-feed';

@NgModule({
  declarations: [
    AlertFeedPage
  ],
  imports: [
    IonicPageModule.forChild(AlertFeedPage)
  ],
  exports: [
    AlertFeedPage
  ],
  entryComponents: [
    AlertFeedPage
  ]
})
export class AlertFeedModule {}
