import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContactsMatchPage } from './contacts-match';

@NgModule({
  declarations: [
    ContactsMatchPage,
  ],
  imports: [
    IonicPageModule.forChild(ContactsMatchPage),
  ],
})
export class ContactsMatchModule {}
