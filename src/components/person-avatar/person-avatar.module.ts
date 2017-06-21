import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PersonAvatarComponent } from './person-avatar';

import { LazyLoadImageModule } from 'ng-lazyload-image';

@NgModule({
  declarations: [
    PersonAvatarComponent,
  ],
  imports: [
    LazyLoadImageModule,
    IonicPageModule.forChild(PersonAvatarComponent),
  ],
  exports: [
    PersonAvatarComponent
  ]
})
export class PersonAvatarModule {}
