import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GroupEditPage } from './group-edit';

import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    GroupEditPage
  ],
  imports: [
    PersonAvatarModule,
    IonicPageModule.forChild(GroupEditPage)
  ],
  exports: [
    GroupEditPage
  ],
  entryComponents: [
    GroupEditPage
  ]
})
export class GroupEditModule {}
