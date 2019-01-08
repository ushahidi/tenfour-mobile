import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { BulkRemovePage } from './bulk-remove';

import { MultiAvatarModule } from '../../components/multi-avatar/multi-avatar.module';

@NgModule({
  declarations: [
    BulkRemovePage
  ],
  imports: [
    MultiAvatarModule,
    IonicPageModule.forChild(BulkRemovePage)
  ],
  exports: [
    BulkRemovePage
  ],
  entryComponents: [
    BulkRemovePage
  ]
})
export class BulkRemoveModule {}
