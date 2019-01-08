import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { SplashScreen } from '@ionic-native/splash-screen';

@Injectable()
export class SplashScreenProvider {

  constructor(
    private platform:Platform,
    private splashScreen:SplashScreen) {

  }

  public show():Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.splashScreen.show();
        resolve(true);
      }
      else {
        resolve(false);
      }
    });
  }

  public hide():Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.splashScreen.hide();
        resolve(true);
      }
      else {
        resolve(false);
      }
    });
  }

}
