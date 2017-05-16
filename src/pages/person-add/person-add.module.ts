import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PersonAddPage } from './person-add';

@NgModule({
  declarations: [
    PersonAddPage,
  ],
  imports: [
    IonicPageModule.forChild(PersonAddPage),
  ],
  exports: [
    PersonAddPage
  ]
})
export class PersonAddModule {}
