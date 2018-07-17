import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { BasePage } from './base-page';

@NgModule({
  declarations: [
    BasePage,
  ],
  imports: [
    IonicPageModule.forChild(BasePage),
  ],
  exports: [
    BasePage
  ]
})
export class BasePageModule {}
