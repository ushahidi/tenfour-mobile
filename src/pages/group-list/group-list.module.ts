import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { GroupListPage } from './group-list';

import { GroupEditModule } from '../../pages/group-edit/group-edit.module';
import { GroupDetailsModule } from '../../pages/group-details/group-details.module';
import { GroupRowModule } from '../../components/group-row/group-row.module';

@NgModule({
  declarations: [
    GroupListPage,
  ],
  imports: [
    GroupEditModule,
    GroupDetailsModule,
    GroupRowModule,
    IonicPageModule.forChild(GroupListPage),
  ],
  exports: [
    GroupListPage
  ],
  entryComponents: [
    GroupListPage
  ]
})
export class GroupListModule {}
