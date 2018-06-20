import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { OrganizationLogoComponent } from './organization-logo';

@NgModule({
  declarations: [
    OrganizationLogoComponent,
  ],
  imports: [
    IonicPageModule.forChild(OrganizationLogoComponent),
  ],
  exports: [
    OrganizationLogoComponent
  ]
})
export class OrganizationLogoModule {}
