import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { GroupDetailsPage } from './group-details';

import { GroupEditModule } from '../../pages/group-edit/group-edit.module';

import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    GroupDetailsPage
  ],
  imports: [
    PersonAvatarModule,
    GroupEditModule,
    IonicPageModule.forChild(GroupDetailsPage)
  ],
  exports: [
    GroupDetailsPage
  ],
  entryComponents: [
    GroupDetailsPage
  ]
})
export class GroupDetailsModule {}
