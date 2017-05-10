import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GroupListPage } from './group-list';

@NgModule({
  declarations: [
    GroupListPage,
  ],
  imports: [
    IonicPageModule.forChild(GroupListPage),
  ],
  exports: [
    GroupListPage
  ]
})
export class GroupListModule {}
