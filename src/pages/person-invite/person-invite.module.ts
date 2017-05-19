import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PersonInvitePage } from './person-invite';

@NgModule({
  declarations: [
    PersonInvitePage,
  ],
  imports: [
    IonicPageModule.forChild(PersonInvitePage),
  ],
  exports: [
    PersonInvitePage
  ]
})
export class PersonInviteModule {}
