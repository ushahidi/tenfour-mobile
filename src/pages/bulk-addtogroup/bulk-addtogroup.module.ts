import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { BulkAddToGroupPage } from './bulk-addtogroup';

import { MultiAvatarModule } from '../../components/multi-avatar/multi-avatar.module';
import { GroupRowModule } from '../../components/group-row/group-row.module';

@NgModule({
  declarations: [
    BulkAddToGroupPage
  ],
  imports: [
    GroupRowModule,
    MultiAvatarModule,
    IonicPageModule.forChild(BulkAddToGroupPage)
  ],
  exports: [
    BulkAddToGroupPage
  ],
  entryComponents: [
    BulkAddToGroupPage
  ]
})
export class BulkAddToGroupModule {}
