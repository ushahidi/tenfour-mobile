import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContactsImportPage } from './contacts-import';

@NgModule({
  declarations: [
    ContactsImportPage
  ],
  imports: [
    IonicPageModule.forChild(ContactsImportPage)
  ],
  exports: [
    ContactsImportPage
  ],
  entryComponents: [
    ContactsImportPage
  ]
})
export class ContactsImportModule {}
