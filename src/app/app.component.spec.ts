import { async, TestBed } from '@angular/core/testing';
import { IonicModule, Platform } from 'ionic-angular';

import { HttpModule } from '@angular/http';
import { SegmentModule } from 'ngx-segment-analytics';
import { NgxLocalStorageModule } from 'ngx-localstorage';

import {} from 'jasmine';

import { HTTP } from '@ionic-native/http';
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
import { Firebase } from '@ionic-native/firebase';

import { TenFourApp } from './app.component';

import { LoggerProvider } from '../providers/logger/logger';
import { ApiProvider } from '../providers/api/api';
import { DatabaseProvider } from '../providers/database/database';
import { CountriesProvider } from '../providers/countries/countries';
import { StorageProvider } from '../providers/storage/storage';
import { LocationProvider } from '../providers/location/location';

import {
  PlatformMock,
  StatusBarMock,
  SplashScreenMock
} from '../../config/mocks-ionic';

describe('TenFourApp Component', () => {
  let fixture;
  let component;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TenFourApp],
      imports: [
        HttpModule,
        NgxLocalStorageModule.forRoot(),
        SegmentModule.forRoot({ apiKey: 'ieZYKiegj7ctbK38BqQKPIwaCommytok', debug: true }),
        IonicModule.forRoot(TenFourApp)
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
        { provide: HTTP, useClass: HTTP },
        { provide: Firebase, useClass: Firebase },
        { provide: ApiProvider, useClass: ApiProvider },
        { provide: LoggerProvider, useClass: LoggerProvider },
        { provide: CountriesProvider, useClass: CountriesProvider },
        { provide: DatabaseProvider, useClass: DatabaseProvider },
        { provide: StorageProvider, useClass: StorageProvider },
        { provide: LocationProvider, useClass: LocationProvider }
      ]
    })
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TenFourApp);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component instanceof TenFourApp).toBe(true);
  });

});
