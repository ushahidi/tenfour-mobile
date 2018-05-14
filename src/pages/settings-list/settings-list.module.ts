import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SettingsListPage } from './settings-list';

import { SettingsRolesModule } from '../../pages/settings-roles/settings-roles.module';
import { SettingsTypesModule } from '../../pages/settings-types/settings-types.module';
import { SettingsRegionsModule } from '../../pages/settings-regions/settings-regions.module';
import { SettingsSizesModule } from '../../pages/setting-sizes/settings-sizes.module';
import { SettingsPaymentsModule } from '../../pages/settings-payments/settings-payments.module';

import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';

@NgModule({
  declarations: [
    SettingsListPage,
  ],
  imports: [
    PersonAvatarModule,
    SettingsRolesModule,
    SettingsTypesModule,
    SettingsRegionsModule,
    SettingsSizesModule,
    SettingsPaymentsModule,
    IonicPageModule.forChild(SettingsListPage),
  ],
  exports: [
    SettingsListPage
  ],
  entryComponents: [
    SettingsListPage
  ]
})
export class SettingsListModule {}
