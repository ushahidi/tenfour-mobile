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

import { NotificationListPage } from '../pages/notification-list/notification-list';

import { SettingsListPage} from '../pages/settings-list/settings-list';
import { SettingsEditPage } from '../pages/settings-edit/settings-edit';
import { SettingsTypesPage } from '../pages/settings-types/settings-types';
import { SettingsSizesPage } from '../pages/settings-sizes/settings-sizes';
import { SettingsRegionsPage } from '../pages/settings-regions/settings-regions';
import { SettingsRolesPage } from '../pages/settings-roles/settings-roles';
import { SettingsPaymentsPage } from '../pages/settings-payments/settings-payments';
import { SettingsCheckinsPage } from '../pages/settings-checkins/settings-checkins';

export class TenFourRoutes {

  static readonly ROUTES = [
    { component: SigninUrlPage, segment: 'signin', priority: 'off' },
    { component: SigninEmailPage, segment: 'signin/email', priority: 'off', defaultHistory: [SigninUrlPage] },
    { component: SigninPasswordPage, segment: 'signin/password', priority: 'off', defaultHistory: [SigninUrlPage, SigninEmailPage] },

    { component: SignupEmailPage, segment: 'signup', priority: 'off' },
    { component: SignupCheckPage, segment: 'signup/check', priority: 'off', defaultHistory: [SignupEmailPage] },
    { component: SignupNamePage, segment: 'signup/name', priority: 'off', defaultHistory: [SignupEmailPage] },
    { component: SignupUrlPage, segment: 'signup/url', priority: 'off', defaultHistory: [SignupEmailPage] },
    { component: SignupPasswordPage, segment: 'signup/password', priority: 'off', defaultHistory: [SignupEmailPage] },
    { component: SignupOwnerPage, segment: 'signup/owner', priority: 'off', defaultHistory: [SignupEmailPage] },
    { component: SignupPlanPage, segment: 'signup/plan', priority: 'off', defaultHistory: [SignupEmailPage] },
    { component: SignupPaymentPage, segment: 'signup/payment', priority: 'off', defaultHistory: [SignupEmailPage] },

    { component: CheckinListPage, segment: 'checkins', priority: 'off' },
    { component: CheckinEditPage, segment: 'checkins/edit', priority: 'off', defaultHistory: [CheckinListPage] },
    { component: CheckinSendPage, segment: 'checkins/send', priority: 'off', defaultHistory: [CheckinListPage] },
    { component: CheckinRespondPage, segment: 'checkins/respond', priority: 'off', defaultHistory: [CheckinListPage] },
    { component: CheckinDetailsPage, segment: 'checkins/:checkin_id', priority: 'off', defaultHistory: [CheckinListPage] },

    { component: PersonListPage, segment: 'people', priority: 'off' },
    { component: PersonEditPage, segment: 'people/edit', priority: 'off', defaultHistory: [PersonListPage] },
    { component: PersonInvitePage, segment: 'people/invite', priority: 'off', defaultHistory: [PersonListPage] },
    { component: PersonImportPage, segment: 'people/import', priority: 'off', defaultHistory: [PersonListPage] },
    { component: PersonSelectPage, segment: 'people/select', priority: 'off', defaultHistory: [PersonListPage] },
    { component: PersonDetailsPage, segment: 'people/:person_id', priority: 'off', defaultHistory: [PersonListPage] },

    { component: GroupListPage, segment: 'groups', priority: 'off' },
    { component: GroupEditPage, segment: 'groups/edit', priority: 'off', defaultHistory: [GroupListPage] },
    { component: GroupDetailsPage, segment: 'groups/:group_id', priority: 'off', defaultHistory: [GroupListPage] },

    { component: NotificationListPage, segment: 'notifications', priority: 'off' },

    { component: SettingsListPage, segment: 'settings', priority: 'off' },
    { component: SettingsEditPage, segment: 'settings/edit', priority: 'off', defaultHistory: [SettingsListPage] },
    { component: SettingsCheckinsPage, segment: 'settings/checkins', priority: 'off', defaultHistory: [SettingsListPage] },
    { component: SettingsRegionsPage, segment: 'settings/regions', priority: 'off', defaultHistory: [SettingsListPage] },
    { component: SettingsRolesPage, segment: 'settings/roles', priority: 'off', defaultHistory: [SettingsListPage] },
    { component: SettingsSizesPage, segment: 'settings/sizes', priority: 'off', defaultHistory: [SettingsListPage] },
    { component: SettingsTypesPage, segment: 'settings/types', priority: 'off', defaultHistory: [SettingsListPage] },
    { component: SettingsPaymentsPage, segment: 'settings/payments', priority: 'off', defaultHistory: [SettingsListPage] }
  ];
}
