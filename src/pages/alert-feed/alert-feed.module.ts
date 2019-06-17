import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { AlertFeedPage } from './alert-feed';
import { DateTimeModule } from '../../pipes/date-time/date-time.module';

@NgModule({
  declarations: [
    AlertFeedPage
  ],
  imports: [
    DateTimeModule,
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
