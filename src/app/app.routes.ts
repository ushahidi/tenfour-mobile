import { SplashScreenPage } from '../pages/splash-screen/splash-screen';

import { OnboardListPage } from '../pages/onboard-list/onboard-list';

import { SigninUrlPage } from '../pages/signin-url/signin-url';
import { SigninEmailPage } from '../pages/signin-email/signin-email';
import { SigninPasswordPage } from '../pages/signin-password/signin-password';
import { SigninInvitePage } from '../pages/signin-invite/signin-invite';

import { SignupEmailPage } from '../pages/signup-email/signup-email';
import { SignupCheckPage } from '../pages/signup-check/signup-check';
import { SignupVerifyPage } from '../pages/signup-verify/signup-verify';
import { SignupOwnerPage } from '../pages/signup-owner/signup-owner';
import { SignupNamePage } from '../pages/signup-name/signup-name';
import { SignupUrlPage} from '../pages/signup-url/signup-url';
import { SignupPlanPage } from '../pages/signup-plan/signup-plan';
import { SignupPaymentPage } from '../pages/signup-payment/signup-payment';
import { SignupPasswordPage } from '../pages/signup-password/signup-password';

import { PersonListPage } from '../pages/person-list/person-list';
import { PersonEditPage } from '../pages/person-edit/person-edit';
import { PersonDetailsPage } from '../pages/person-details/person-details';
import { PersonProfilePage } from '../pages/person-profile/person-profile';
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
import { SettingsChannelsPage } from '../pages/settings-channels/settings-channels';

import { UnsubscribePage } from '../pages/unsubscribe/unsubscribe';

export class TenFourRoutes {

  static readonly ROUTES = [
    { component: SplashScreenPage, name: 'SplashScreenPage', segment: 'loading' },

    { component: SigninUrlPage, name: 'SigninUrlPage', segment: 'signin' },
    { component: SigninEmailPage, name: 'SigninEmailPage', segment: 'signin/email', defaultHistory: ['SigninUrlPage'] },
    { component: SigninInvitePage, name: 'SigninInvitePage', segment: 'signin/invite/:email/:subdomain/:token', defaultHistory: ['SigninUrlPage'] },
    { component: SigninPasswordPage, name: 'SigninPasswordPage', segment: 'signin/password', defaultHistory: ['SigninUrlPage', 'SigninEmailPage'] },

    { component: SignupEmailPage, name: 'SignupEmailPage', segment: 'signup', defaultHistory: ['SigninUrlPage'] },
    { component: SignupCheckPage, name: 'SignupCheckPage', segment: 'signup/check', defaultHistory: ['SigninUrlPage', 'SignupEmailPage'] },
    { component: SignupVerifyPage, name: 'SignupVerifyPage', segment: 'signup/verify/:email/:token', defaultHistory: ['SigninUrlPage', 'SignupEmailPage'] },
    { component: SignupOwnerPage, name: 'SignupOwnerPage', segment: 'signup/owner', defaultHistory: ['SigninUrlPage', 'SignupEmailPage'] },
    { component: SignupNamePage, name: 'SignupNamePage', segment: 'signup/name', defaultHistory: ['SigninUrlPage', 'SignupEmailPage', 'SignupOwnerPage'] },
    { component: SignupUrlPage, name: 'SignupUrlPage', segment: 'signup/url', defaultHistory: ['SigninUrlPage', 'SignupEmailPage', 'SignupOwnerPage', 'SignupNamePage'] },
    { component: SignupPlanPage, name: 'SignupPlanPage', segment: 'signup/plan', defaultHistory: ['SigninUrlPage', 'SignupEmailPage', 'SignupOwnerPage', 'SignupNamePage', 'SignupUrlPage'] },
    { component: SignupPaymentPage, name: 'SignupPaymentPage', segment: 'signup/payment', defaultHistory: ['SigninUrlPage', 'SignupEmailPage', 'SignupOwnerPage', 'SignupNamePage', 'SignupUrlPage'] },
    { component: SignupPasswordPage, name: 'SignupPasswordPage', segment: 'signup/password', defaultHistory: ['SigninUrlPage', 'SignupEmailPage', 'SignupOwnerPage', 'SignupNamePage', 'SignupUrlPage', 'SignupPlanPage'] },

    { component: OnboardListPage, name: 'OnboardListPage', segment: 'onboarding' },

    { component: CheckinListPage, name: 'CheckinListPage', segment: 'checkins' },
    { component: CheckinEditPage, name: 'CheckinEditPage', segment: 'checkins/edit', defaultHistory: ['CheckinListPage'] },
    { component: CheckinSendPage, name: 'CheckinSendPage', segment: 'checkins/send', defaultHistory: ['CheckinListPage'] },
    { component: CheckinRespondPage, name: 'CheckinRespondPage', segment: 'checkins/respond', defaultHistory: ['CheckinListPage'] },
    { component: CheckinDetailsPage, name: 'CheckinDetailsPage', segment: 'checkins/:checkin_id', defaultHistory: ['CheckinListPage'] },

    { component: PersonProfilePage, name: 'PersonProfilePage', segment: 'profile' },

    { component: PersonListPage, name: 'PersonListPage', segment: 'people' },
    { component: PersonEditPage, name: 'PersonEditPage', segment: 'people/edit', defaultHistory: ['PersonListPage'] },
    { component: PersonInvitePage, name: 'PersonInvitePage', segment: 'people/invite', defaultHistory: ['PersonListPage'] },
    { component: PersonImportPage, name: 'PersonImportPage', segment: 'people/import', defaultHistory: ['PersonListPage'] },
    { component: PersonSelectPage, name: 'PersonSelectPage', segment: 'people/select', defaultHistory: ['PersonListPage'] },
    { component: PersonDetailsPage, name: 'PersonDetailsPage', segment: 'people/:person_id', defaultHistory: ['PersonListPage'] },

    { component: GroupListPage, name: 'GroupListPage', segment: 'groups' },
    { component: GroupEditPage, name: 'GroupEditPage', segment: 'groups/edit', defaultHistory: ['GroupListPage'] },
    { component: GroupDetailsPage, name: 'GroupDetailsPage', segment: 'groups/:group_id', defaultHistory: ['GroupListPage'] },

    { component: NotificationListPage, name: 'NotificationListPage', segment: 'notifications' },

    { component: SettingsListPage, name: 'SettingsListPage', segment: 'settings' },
    { component: SettingsEditPage, name: 'SettingsEditPage', segment: 'settings/edit', defaultHistory: ['SettingsListPage'] },
    { component: SettingsChannelsPage, name: 'SettingsChannelsPage', segment: 'settings/channels', defaultHistory: ['SettingsListPage'] },
    { component: SettingsRegionsPage, name: 'SettingsRegionsPage', segment: 'settings/regions', defaultHistory: ['SettingsListPage'] },
    { component: SettingsRolesPage, name: 'SettingsRolesPage', segment: 'settings/roles', defaultHistory: ['SettingsListPage'] },
    { component: SettingsSizesPage, name: 'SettingsSizesPage', segment: 'settings/sizes', defaultHistory: ['SettingsListPage'] },
    { component: SettingsTypesPage, name: 'SettingsTypesPage', segment: 'settings/types', defaultHistory: ['SettingsListPage'] },
    { component: SettingsPaymentsPage, name: 'SettingsPaymentsPage', segment: 'settings/payments', defaultHistory: ['SettingsListPage'] },

    { component: UnsubscribePage, name: 'UnsubscribePage', segment: 'unsubscribe/:email/:token/:org_name' },
  ];
}
