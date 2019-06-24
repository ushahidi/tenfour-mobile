import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { AlertFeedEntriesPage } from './alert-feed-entries';
import { DateTimeModule } from '../../pipes/date-time/date-time.module';

@NgModule({
  declarations: [
    AlertFeedEntriesPage
  ],
  imports: [
    DateTimeModule,
    IonicPageModule.forChild(AlertFeedEntriesPage)
  ],
  exports: [
    AlertFeedEntriesPage
  ],
  entryComponents: [
    AlertFeedEntriesPage
  ]
})
export class AlertFeedEntriesModule {}
