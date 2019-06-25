import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PersonImportPage } from './person-import';

@NgModule({
  declarations: [
    PersonImportPage
  ],
  imports: [
    IonicPageModule.forChild(PersonImportPage)
  ],
  exports: [
    PersonImportPage
  ],
  entryComponents: [
    PersonImportPage
  ]
})
export class PersonImportModule {}
