import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OnboardListPage } from './onboard-list';

@NgModule({
  declarations: [
    OnboardListPage,
  ],
  imports: [
    IonicPageModule.forChild(OnboardListPage),
  ],
  exports: [
    OnboardListPage
  ]
})
export class OnboardListModule {}
