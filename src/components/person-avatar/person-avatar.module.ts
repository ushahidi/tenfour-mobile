import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PersonAvatarComponent } from './person-avatar';

@NgModule({
  declarations: [
    PersonAvatarComponent
  ],
  imports: [
    IonicPageModule.forChild(PersonAvatarComponent)
  ],
  exports: [
    PersonAvatarComponent
  ]
})
export class PersonAvatarModule {}
