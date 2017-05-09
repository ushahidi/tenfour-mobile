import { Component, Injector } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { SigninUrlPage } from '../pages/signin-url/signin-url';

import { InjectorService } from '../providers/injector-service';

@Component({
  templateUrl: 'app.html'
})
export class RollcallApp {

  rootPage:any = SigninUrlPage;

  constructor(
    platform:Platform,
    injector:Injector,
    statusBar:StatusBar,
    splashScreen:SplashScreen) {
    InjectorService.injector = injector;
    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}
