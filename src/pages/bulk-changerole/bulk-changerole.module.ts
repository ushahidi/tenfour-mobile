import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { BulkChangeRolePage } from './bulk-changerole';

import { MultiAvatarModule } from '../../components/multi-avatar/multi-avatar.module';

@NgModule({
  declarations: [
    BulkChangeRolePage
  ],
  imports: [
    MultiAvatarModule,
    IonicPageModule.forChild(BulkChangeRolePage)
  ],
  exports: [
    BulkChangeRolePage
  ],
  entryComponents: [
    BulkChangeRolePage
  ]
})
export class BulkChangeRoleModule {}
