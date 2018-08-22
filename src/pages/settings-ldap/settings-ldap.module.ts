import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SettingsLDAPPage } from './settings-ldap';

@NgModule({
  declarations: [
    SettingsLDAPPage,
  ],
  imports: [
    IonicPageModule.forChild(SettingsLDAPPage),
  ],
  exports: [
    SettingsLDAPPage
  ],
  entryComponents: [
    SettingsLDAPPage
  ]
})
export class SettingsLDAPModule {}
