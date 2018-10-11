import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { BulkAddToGroupModule } from '../../pages/bulk-addtogroup/bulk-addtogroup.module';

import { BulkActionsComponent } from './bulk-actions';

@NgModule({
  declarations: [
    BulkActionsComponent,
  ],
  imports: [
    BulkAddToGroupModule,
    IonicPageModule.forChild(BulkActionsComponent),
  ],
  exports: [
    BulkActionsComponent
  ]
})
export class BulkActionsModule {}
