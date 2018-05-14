import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PersonInvitePage } from './person-invite';

import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    PersonInvitePage,
  ],
  imports: [
    PersonAvatarModule,
    IonicPageModule.forChild(PersonInvitePage),
  ],
  exports: [
    PersonInvitePage
  ],
  entryComponents: [
    PersonInvitePage
  ]
})
export class PersonInviteModule {}
