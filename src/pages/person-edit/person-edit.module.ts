import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PersonEditPage } from './person-edit';

@NgModule({
  declarations: [
    PersonEditPage,
  ],
  imports: [
    IonicPageModule.forChild(PersonEditPage),
  ],
  exports: [
    PersonEditPage
  ]
})
export class PersonEditModule {}
