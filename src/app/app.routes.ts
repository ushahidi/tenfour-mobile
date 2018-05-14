import { SigninUrlPage } from '../pages/signin-url/signin-url';
import { SigninEmailPage } from '../pages/signin-email/signin-email';
import { SigninPasswordPage } from '../pages/signin-password/signin-password';

import { SignupUrlPage} from '../pages/signup-url/signup-url';
import { SignupEmailPage } from '../pages/signup-email/signup-email';
import { SignupNamePage } from '../pages/signup-name/signup-name';
import { SignupOwnerPage } from '../pages/signup-owner/signup-owner';
import { SignupCheckPage } from '../pages/signup-check/signup-check';
import { SignupPlanPage } from '../pages/signup-plan/signup-plan';
import { SignupPaymentPage } from '../pages/signup-payment/signup-payment';
import { SignupPasswordPage } from '../pages/signup-password/signup-password';

import { PersonListPage } from '../pages/person-list/person-list';
import { PersonEditPage } from '../pages/person-edit/person-edit';
import { PersonDetailsPage } from '../pages/person-details/person-details';
import { PersonInvitePage } from '../pages/person-invite/person-invite';
import { PersonImportPage } from '../pages/person-import/person-import';
import { PersonSelectPage } from '../pages/person-select/person-select';

import { CheckinListPage } from '../pages/checkin-list/checkin-list';
import { CheckinDetailsPage } from '../pages/checkin-details/checkin-details';
import { CheckinEditPage } from '../pages/checkin-edit/checkin-edit';
import { CheckinSendPage } from '../pages/checkin-send/checkin-send';
import { CheckinTestPage } from '../pages/checkin-test/checkin-test';
import { CheckinRespondPage } from '../pages/checkin-respond/checkin-respond';

import { GroupListPage } from '../pages/group-list/group-list';
import { GroupEditPage } from '../pages/group-edit/group-edit';
import { GroupDetailsPage } from '../pages/group-details/group-details';

import { SettingsListPage} from '../pages/settings-list/settings-list';
import { SettingsEditPage } from '../pages/settings-edit/settings-edit';
import { SettingsTypesPage } from '../pages/settings-types/settings-types';
import { SettingsSizesPage } from '../pages/settings-sizes/settings-sizes';
import { SettingsRegionsPage } from '../pages/settings-regions/settings-regions';
import { SettingsRolesPage } from '../pages/settings-roles/settings-roles';
import { SettingsPaymentsPage } from '../pages/settings-payments/settings-payments';
import { SettingsCheckinsPage } from '../pages/settings-checkins/settings-checkins';

export class TenFourRoutes {

  static readonly LINKS = [
    { component: SigninUrlPage, segment: 'signin' },
    { component: SigninEmailPage, segment: 'signin/email', defaultHistory: [SigninUrlPage] },
    { component: SigninPasswordPage, segment: 'signin/password', defaultHistory: [SigninUrlPage, SigninEmailPage] },

    { component: SignupEmailPage, segment: 'signup' },
    { component: SignupCheckPage, segment: 'signup/check', defaultHistory: [SignupEmailPage] },
    { component: SignupNamePage, segment: 'signup/name', defaultHistory: [SignupEmailPage] },
    { component: SignupUrlPage, segment: 'signup/url', defaultHistory: [SignupEmailPage] },
    { component: SignupPasswordPage, segment: 'signup/password', defaultHistory: [SignupEmailPage] },
    { component: SignupOwnerPage, segment: 'signup/owner', defaultHistory: [SignupEmailPage] },
    { component: SignupPlanPage, segment: 'signup/plan', defaultHistory: [SignupEmailPage] },
    { component: SignupPaymentPage, segment: 'signup/payment', defaultHistory: [SignupEmailPage] },

    { component: CheckinListPage, segment: 'checkins' },
    { component: CheckinEditPage, segment: 'checkins/edit', defaultHistory: [CheckinListPage] },
    { component: CheckinDetailsPage, segment: 'checkins/:checkin_id', defaultHistory: [CheckinListPage] },
    { component: CheckinSendPage, segment: 'checkins/send', defaultHistory: [CheckinListPage] },
    { component: CheckinRespondPage, segment: 'checkins/:checkin_id/respond', defaultHistory: [CheckinListPage] },

    { component: GroupListPage, segment: 'groups' },
    { component: GroupDetailsPage, segment: 'groups/:group_id', defaultHistory: [GroupListPage] },
    { component: GroupEditPage, segment: 'groups/edit', defaultHistory: [GroupListPage] },

    { component: PersonListPage, segment: 'people' },
    { component: PersonDetailsPage, segment: 'people/:person_id', defaultHistory: [PersonListPage] },
    { component: PersonEditPage, segment: 'people/edit', defaultHistory: [PersonListPage] },
    { component: PersonInvitePage, segment: 'people/invite', defaultHistory: [PersonListPage] },
    { component: PersonImportPage, segment: 'people/import', defaultHistory: [PersonListPage] },
    { component: PersonSelectPage, segment: 'people/select', defaultHistory: [PersonListPage] },

    { component: SettingsListPage, segment: 'settings' },
    { component: SettingsEditPage, segment: 'settings/edit', defaultHistory: [SettingsListPage] },
    { component: SettingsCheckinsPage, segment: 'settings/checkins', defaultHistory: [SettingsListPage] },
    { component: SettingsRegionsPage, segment: 'settings/regions', defaultHistory: [SettingsListPage] },
    { component: SettingsRolesPage, segment: 'settings/roles', defaultHistory: [SettingsListPage] },
    { component: SettingsSizesPage, segment: 'settings/sizes', defaultHistory: [SettingsListPage] },
    { component: SettingsTypesPage, segment: 'settings/types', defaultHistory: [SettingsListPage] },
    { component: SettingsPaymentsPage, segment: 'settings/payments', defaultHistory: [SettingsListPage] }
  ];
}
