import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { BulkAddToGroupModule } from '../../pages/bulk-addtogroup/bulk-addtogroup.module';
import { BulkChangeRoleModule } from '../../pages/bulk-changerole/bulk-changerole.module';
import { BulkRemoveModule } from '../../pages/bulk-remove/bulk-remove.module';

import { BulkActionsComponent } from './bulk-actions';

@NgModule({
  declarations: [
    BulkActionsComponent,
  ],
  imports: [
    BulkAddToGroupModule,
    BulkChangeRoleModule,
    BulkRemoveModule,
    IonicPageModule.forChild(BulkActionsComponent),
  ],
  exports: [
    BulkActionsComponent
  ]
})
export class BulkActionsModule {}
