import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { BasePrivatePage } from './base-private-page';

@NgModule({
  declarations: [
    BasePrivatePage,
  ],
  imports: [
    IonicPageModule.forChild(BasePrivatePage),
  ],
  exports: [
    BasePrivatePage
  ]
})
export class BasePrivatePageModule {}
