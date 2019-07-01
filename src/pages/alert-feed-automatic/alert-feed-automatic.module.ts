import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { AlertFeedAutomaticPage } from './alert-feed-automatic';
import { DateTimeModule } from '../../pipes/date-time/date-time.module';

@NgModule({
  declarations: [
    AlertFeedAutomaticPage
  ],
  imports: [
    DateTimeModule,
    IonicPageModule.forChild(AlertFeedAutomaticPage)
  ],
  exports: [
    AlertFeedAutomaticPage
  ],
  entryComponents: [
    AlertFeedAutomaticPage
  ]
})
export class AlertFeedAutomaticModule {}
