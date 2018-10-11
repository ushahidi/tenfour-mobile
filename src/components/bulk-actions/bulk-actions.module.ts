import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { BulkActionsComponent } from './bulk-actions';

@NgModule({
  declarations: [
    BulkActionsComponent,
  ],
  imports: [
    IonicPageModule.forChild(BulkActionsComponent),
  ],
  exports: [
    BulkActionsComponent
  ]
})
export class BulkActionsModule {}
