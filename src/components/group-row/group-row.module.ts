import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { GroupRowComponent } from './group-row';

@NgModule({
  declarations: [
    GroupRowComponent
  ],
  imports: [
    IonicPageModule.forChild(GroupRowComponent)
  ],
  exports: [
    GroupRowComponent
  ]
})
export class GroupRowModule {}
