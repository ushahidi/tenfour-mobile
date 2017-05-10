import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppVersion } from '@ionic-native/app-version';
import { IsDebug } from '@ionic-native/is-debug';
import { StatusBar } from '@ionic-native/status-bar';
import { Transfer } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { Camera } from '@ionic-native/camera';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Network } from '@ionic-native/network';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Geolocation } from '@ionic-native/geolocation';
import { Diagnostic } from '@ionic-native/diagnostic';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SQLite } from '@ionic-native/sqlite';
import { Keyboard } from '@ionic-native/keyboard';
import { NativeStorage } from '@ionic-native/native-storage';

import { RollcallApp } from './app.component';

import { SigninUrlPage } from '../pages/signin-url/signin-url';
import { SigninEmailPage } from '../pages/signin-email/signin-email';
import { SigninPasswordPage } from '../pages/signin-password/signin-password';

import { SignupUrlPage } from '../pages/signup-url/signup-url';
import { SignupEmailPage } from '../pages/signup-email/signup-email';
import { SignupNamePage } from '../pages/signup-name/signup-name';
import { SignupPlanPage } from '../pages/signup-plan/signup-plan';
import { SignupPasswordPage } from '../pages/signup-password/signup-password';

import { RollcallListPage } from '../pages/rollcall-list/rollcall-list';
import { GroupListPage } from '../pages/group-list/group-list';
import { PeopleListPage } from '../pages/people-list/people-list';
import { SettingsPage } from '../pages/settings/settings';

import { DateTimePipe } from '../pipes/date-time';
import { TimeAgoPipe } from '../pipes/time-ago';
import { TitleizePipe } from '../pipes/titleize';
import { CapitalizePipe } from '../pipes/capitalize';
import { TruncatePipe } from '../pipes/truncate';
import { HtmlParserPipe } from '../pipes/html-parser';

import { LoggerService } from '../providers/logger-service';
import { ApiService } from '../providers/api-service';
import { DatabaseService } from '../providers/database-service';

@NgModule({
  declarations: [
    RollcallApp,
    SigninUrlPage,
    SigninEmailPage,
    SigninPasswordPage,
    SignupUrlPage,
    SignupEmailPage,
    SignupNamePage,
    SignupPlanPage,
    SignupPasswordPage,
    RollcallListPage,
    GroupListPage,
    PeopleListPage,
    SettingsPage,
    DateTimePipe,
    TimeAgoPipe,
    TitleizePipe,
    CapitalizePipe,
    TruncatePipe,
    HtmlParserPipe
  ],
  imports: [
    HttpModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule.forRoot(RollcallApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    RollcallApp,
    SigninUrlPage,
    SigninEmailPage,
    SigninUrlPage,
    SigninPasswordPage,
    SignupUrlPage,
    SignupEmailPage,
    SignupNamePage,
    SignupPlanPage,
    SignupPasswordPage,
    RollcallListPage,
    GroupListPage,
    PeopleListPage,
    SettingsPage
  ],
  providers: [
    { provide: File, useClass: File },
    { provide: SQLite, useClass: SQLite },
    { provide: Camera, useClass: Camera },
    { provide: IsDebug, useClass: IsDebug },
    { provide: Network, useClass: Network },
    { provide: Keyboard, useClass: Keyboard },
    { provide: Transfer, useClass: Transfer },
    { provide: StatusBar, useClass: StatusBar },
    { provide: AppVersion, useClass: AppVersion },
    { provide: Diagnostic, useClass: Diagnostic },
    { provide: Geolocation, useClass: Geolocation },
    { provide: SplashScreen, useClass: SplashScreen },
    { provide: InAppBrowser, useClass: InAppBrowser },
    { provide: SocialSharing, useClass: SocialSharing },
    { provide: NativeStorage, useClass: NativeStorage },
    { provide: ApiService, useClass: ApiService },
    { provide: LoggerService, useClass: LoggerService },
    { provide: DatabaseService, useClass: DatabaseService },
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule {}
