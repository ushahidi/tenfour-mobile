import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PeopleListPage } from './people-list';

@NgModule({
  declarations: [
    PeopleListPage,
  ],
  imports: [
    IonicPageModule.forChild(PeopleListPage),
  ],
  exports: [
    PeopleListPage
  ]
})
export class PeopleListModule {}
