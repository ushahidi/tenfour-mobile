import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { DateTimeModule } from '../../pipes/date-time/date-time.module';

import { SettingsLDAPPage } from './settings-ldap';

@NgModule({
  declarations: [
    SettingsLDAPPage,
  ],
  imports: [
    DateTimeModule,
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
