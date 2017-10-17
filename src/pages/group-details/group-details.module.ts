import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GroupDetailsPage } from './group-details';

import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    GroupDetailsPage,
  ],
  imports: [
    PersonAvatarModule,
    IonicPageModule.forChild(GroupDetailsPage),
  ],
  exports: [
    GroupDetailsPage
  ]
})
export class GroupDetailsModule {}
