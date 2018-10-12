import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { BulkAddToGroupModule } from '../../pages/bulk-addtogroup/bulk-addtogroup.module';
import { BulkChangeRoleModule } from '../../pages/bulk-changerole/bulk-changerole.module';

import { BulkActionsComponent } from './bulk-actions';

@NgModule({
  declarations: [
    BulkActionsComponent,
  ],
  imports: [
    BulkAddToGroupModule,
    BulkChangeRoleModule,
    IonicPageModule.forChild(BulkActionsComponent),
  ],
  exports: [
    BulkActionsComponent
  ]
})
export class BulkActionsModule {}
