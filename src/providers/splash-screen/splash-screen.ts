import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { SplashScreen } from '@ionic-native/splash-screen';

import { LoggerProvider } from '../../providers/logger/logger';

@Injectable()
export class SplashScreenProvider {

  constructor(
    private platform:Platform,
    private splashScreen:SplashScreen,
    private logger:LoggerProvider) {

  }

  public show() {
    if (this.platform.is("cordova")) {
      this.splashScreen.show();
    }
  }

  public hide() {
    if (this.platform.is("cordova")) {
      this.splashScreen.hide();
    }
  }

}
