import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { PersonListPage } from './person-list';
import { PersonEditModule } from '../../pages/person-edit/person-edit.module';
import { PersonDetailsModule } from '../../pages/person-details/person-details.module';

import { PersonAvatarModule } from '../../components/person-avatar/person-avatar.module';
import { PersonRowModule } from '../../components/person-row/person-row.module';
import { BulkActionsModule } from '../../components/bulk-actions/bulk-actions.module';
import { GroupByModule } from '../../pipes/group-by/group-by.module';

@NgModule({
  declarations: [
    PersonListPage
  ],
  imports: [
    PersonAvatarModule,
    PersonRowModule,
    PersonEditModule,
    PersonDetailsModule,
    GroupByModule,
    BulkActionsModule,
    IonicPageModule.forChild(PersonListPage)
  ],
  exports: [
    PersonListPage
  ],
  entryComponents: [
    PersonListPage
  ]
})
export class PersonListModule {}
