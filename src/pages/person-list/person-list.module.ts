import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PersonListPage } from './person-list';

import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    PersonListPage,
  ],
  imports: [
    PersonAvatarModule,
    IonicPageModule.forChild(PersonListPage),
  ],
  exports: [
    PersonListPage
  ]
})
export class PersonListModule {}
