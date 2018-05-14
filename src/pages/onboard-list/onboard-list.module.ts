import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { OnboardListPage } from './onboard-list';

import { PersonEditModule } from '../../pages/person-edit/person-edit.module';
import { PersonInviteModule } from '../../pages/person-invite/person-invite.module';
import { PersonImportModule } from '../../pages/person-import/person-import.module';
import { CheckinTestModule } from '../../pages/checkin-test/checkin-test.module';
import { CheckinListModule } from '../../pages/checkin-list/checkin-list.module';

@NgModule({
  declarations: [
    OnboardListPage,
  ],
  imports: [
    PersonEditModule,
    PersonInviteModule,
    PersonImportModule,
    CheckinTestModule,
    CheckinListModule,
    IonicPageModule.forChild(OnboardListPage),
  ],
  exports: [
    OnboardListPage
  ],
  entryComponents: [
    OnboardListPage
  ]
})
export class OnboardListModule {}
