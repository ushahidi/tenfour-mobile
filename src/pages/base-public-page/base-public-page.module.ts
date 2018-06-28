import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { BasePublicPage } from './base-public-page';

@NgModule({
  declarations: [
    BasePublicPage,
  ],
  imports: [
    IonicPageModule.forChild(BasePublicPage),
  ],
  exports: [
    BasePublicPage
  ]
})
export class BasePublicPageModule {}
