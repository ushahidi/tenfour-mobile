import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { PersonRowComponent } from './person-row';

import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    PersonRowComponent
  ],
  imports: [
    PersonAvatarModule,
    IonicPageModule.forChild(PersonRowComponent)
  ],
  exports: [
    PersonRowComponent
  ]
})
export class PersonRowModule {}
