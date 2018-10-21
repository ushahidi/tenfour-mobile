import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MultiAvatarComponent } from './multi-avatar';
import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    MultiAvatarComponent,
  ],
  imports: [
    PersonAvatarModule,
    IonicPageModule.forChild(MultiAvatarComponent),
  ],
  exports: [
    MultiAvatarComponent
  ]
})
export class MultiAvatarModule {}
