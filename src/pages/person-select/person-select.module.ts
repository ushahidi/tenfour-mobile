import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { PersonSelectPage } from './person-select';

import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    PersonSelectPage,
  ],
  imports: [
    PersonAvatarModule,
    IonicPageModule.forChild(PersonSelectPage),
  ],
  exports: [
    PersonSelectPage
  ],
  entryComponents: [
    PersonSelectPage
  ]
})
export class PersonSelectModule {}
