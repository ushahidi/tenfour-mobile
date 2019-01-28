import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SigninLookupPage } from './signin-lookup';

@NgModule({
  declarations: [
    SigninLookupPage
  ],
  imports: [
    IonicPageModule.forChild(SigninLookupPage)
  ],
  exports: [
    SigninLookupPage
  ],
  entryComponents: [
    SigninLookupPage
  ]
})
export class SigninLookupModule {}
