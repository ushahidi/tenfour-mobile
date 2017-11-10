import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SegmentModule } from 'ngx-segment-analytics';

import { AppVersion } from '@ionic-native/app-version';
import { IsDebug } from '@ionic-native/is-debug';
import { StatusBar } from '@ionic-native/status-bar';
import { FileTransfer } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { Camera } from '@ionic-native/camera';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Network } from '@ionic-native/network';
import { ThemeableBrowser } from '@ionic-native/themeable-browser';
import { Geolocation } from '@ionic-native/geolocation';
import { Diagnostic } from '@ionic-native/diagnostic';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SQLite } from '@ionic-native/sqlite';
import { Keyboard } from '@ionic-native/keyboard';
import { NativeStorage } from '@ionic-native/native-storage';
import { AppAvailability } from '@ionic-native/app-availability';
import { Deeplinks } from '@ionic-native/deeplinks';
import { Contacts } from '@ionic-native/contacts';
import { Device } from '@ionic-native/device';
import { Sim } from '@ionic-native/sim';
import { NativeGeocoder } from '@ionic-native/native-geocoder';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Badge } from '@ionic-native/badge';

import { RollcallApp } from './app.component';

import { SigninUrlModule } from '../pages/signin-url/signin-url.module';
import { SigninEmailModule } from '../pages/signin-email/signin-email.module';
import { SigninPasswordModule } from '../pages/signin-password/signin-password.module';

import { SignupUrlModule} from '../pages/signup-url/signup-url.module';
import { SignupEmailModule } from '../pages/signup-email/signup-email.module';
import { SignupNameModule } from '../pages/signup-name/signup-name.module';
import { SignupOwnerModule } from '../pages/signup-owner/signup-owner.module';
import { SignupCheckModule } from '../pages/signup-check/signup-check.module';
import { SignupConfirmModule } from '../pages/signup-confirm/signup-confirm.module';
import { SignupPlanModule } from '../pages/signup-plan/signup-plan.module';
import { SignupPaymentModule } from '../pages/signup-payment/signup-payment.module';
import { SignupPasswordModule } from '../pages/signup-password/signup-password.module';

import { PersonListModule } from '../pages/person-list/person-list.module';
import { PersonAddModule } from '../pages/person-add/person-add.module';
import { PersonEditModule } from '../pages/person-edit/person-edit.module';
import { PersonDetailsModule } from '../pages/person-details/person-details.module';
import { PersonInviteModule } from '../pages/person-invite/person-invite.module';
import { PersonImportModule } from '../pages/person-import/person-import.module';
import { PersonSelectModule } from '../pages/person-select/person-select.module';

import { RollcallListModule } from '../pages/rollcall-list/rollcall-list.module';
import { RollcallEditModule } from '../pages/rollcall-edit/rollcall-edit.module';
import { RollcallSendModule } from '../pages/rollcall-send/rollcall-send.module';
import { RollcallTestModule } from '../pages/rollcall-test/rollcall-test.module';

import { ReplyListModule } from '../pages/reply-list/reply-list.module';
import { ReplySendModule } from '../pages/reply-send/reply-send.module';

import { OnboardListModule } from '../pages/onboard-list/onboard-list.module';

import { GroupListModule } from '../pages/group-list/group-list.module';
import { GroupEditModule } from '../pages/group-edit/group-edit.module';
import { GroupDetailsModule } from '../pages/group-details/group-details.module';

import { NotificationListModule } from '../pages/notification-list/notification-list.module';

import { SettingsListModule } from '../pages/settings-list/settings-list.module';
import { SettingsEditModule } from '../pages/settings-edit/settings-edit.module';
import { SettingsTypesModule } from '../pages/settings-types/settings-types.module';
import { SettingsSizesModule } from '../pages/settings-sizes/settings-sizes.module';
import { SettingsRegionsModule } from '../pages/settings-regions/settings-regions.module';
import { SettingsRolesModule } from '../pages/settings-roles/settings-roles.module';
import { SettingsPaymentsModule } from '../pages/settings-payments/settings-payments.module';
import { SettingsRollcallsModule } from '../pages/settings-rollcalls/settings-rollcalls.module';

import { DateTimeModule } from '../pipes/date-time.module';
import { TimeAgoModule } from '../pipes/time-ago.module';
import { TitleizeModule } from '../pipes/titleize.module';
import { CapitalizeModule } from '../pipes/capitalize.module';
import { TruncateModule } from '../pipes/truncate.module';
import { HtmlParserModule } from '../pipes/html-parser.module';

import { SendViaModule } from '../components/send-via/send-via.module';
import { ColorPickerModule } from '../components/color-picker/color-picker.module';
import { PersonAvatarModule } from '../components/person-avatar/person-avatar.module';

import { LoggerService } from '../providers/logger-service';
import { ApiService } from '../providers/api-service';
import { DatabaseService } from '../providers/database-service';
import { CountryService } from '../providers/country-service';

@NgModule({
  declarations: [
    RollcallApp
  ],
  imports: [
    HttpModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    PersonAvatarModule,
    ColorPickerModule,
    SendViaModule,
    GroupListModule,
    GroupEditModule,
    GroupDetailsModule,
    SigninUrlModule,
    SigninEmailModule,
    SigninUrlModule,
    SigninPasswordModule,
    SignupUrlModule,
    SignupEmailModule,
    SignupNameModule,
    SignupOwnerModule,
    SignupCheckModule,
    SignupConfirmModule,
    SignupPlanModule,
    SignupPaymentModule,
    SignupPasswordModule,
    OnboardListModule,
    RollcallListModule,
    RollcallEditModule,
    RollcallSendModule,
    RollcallTestModule,
    ReplyListModule,
    ReplySendModule,
    NotificationListModule,
    PersonListModule,
    PersonAddModule,
    PersonEditModule,
    PersonDetailsModule,
    PersonInviteModule,
    PersonImportModule,
    PersonSelectModule,
    SettingsListModule,
    SettingsEditModule,
    SettingsTypesModule,
    SettingsRolesModule,
    SettingsPaymentsModule,
    SettingsRollcallsModule,
    SettingsSizesModule,
    SettingsRegionsModule,
    DateTimeModule,
    DateTimeModule,
    TimeAgoModule,
    TitleizeModule,
    CapitalizeModule,
    TruncateModule,
    HtmlParserModule,
    BrowserAnimationsModule,
    SegmentModule.forRoot({ apiKey: 'ieZYKiegj7ctbK38BqQKPIwaCommytok', debug: true }),
    IonicModule.forRoot(RollcallApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    RollcallApp
  ],
  providers: [
    { provide: File, useClass: File },
    { provide: Device, useClass: Device },
    { provide: SQLite, useClass: SQLite },
    { provide: Camera, useClass: Camera },
    { provide: IsDebug, useClass: IsDebug },
    { provide: Network, useClass: Network },
    { provide: Keyboard, useClass: Keyboard },
    { provide: FileTransfer, useClass: FileTransfer },
    { provide: StatusBar, useClass: StatusBar },
    { provide: AppVersion, useClass: AppVersion },
    { provide: Diagnostic, useClass: Diagnostic },
    { provide: Geolocation, useClass: Geolocation },
    { provide: NativeGeocoder, useClass: NativeGeocoder },
    { provide: SplashScreen, useClass: SplashScreen },
    { provide: ThemeableBrowser, useClass: ThemeableBrowser },
    { provide: SocialSharing, useClass: SocialSharing },
    { provide: NativeStorage, useClass: NativeStorage },
    { provide: AppAvailability, useClass: AppAvailability },
    { provide: ScreenOrientation, useClass: ScreenOrientation },
    { provide: Deeplinks, useClass: Deeplinks },
    { provide: Contacts, useClass: Contacts },
    { provide: Badge, useClass: Badge },
    { provide: Sim, useClass: Sim },
    { provide: ApiService, useClass: ApiService },
    { provide: LoggerService, useClass: LoggerService },
    { provide: CountryService, useClass: CountryService },
    { provide: DatabaseService, useClass: DatabaseService },
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule {}
