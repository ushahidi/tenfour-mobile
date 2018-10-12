import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { BulkInvitePage } from './bulk-invite';

import { MultiAvatarModule } from '../../components/multi-avatar/multi-avatar.module';

@NgModule({
  declarations: [
    BulkInvitePage,
  ],
  imports: [
    MultiAvatarModule,
    IonicPageModule.forChild(BulkInvitePage),
  ],
  exports: [
    BulkInvitePage
  ],
  entryComponents: [
    BulkInvitePage
  ]
})
export class BulkInviteModule {}
