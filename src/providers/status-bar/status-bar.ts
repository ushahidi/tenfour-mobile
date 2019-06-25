import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';

@Injectable()
export class StatusBarProvider {

  constructor(
    private platform:Platform,
    private statusBar:StatusBar) {
  }

  public setStyle(lightContent:boolean) {
    if (this.platform.is("cordova")) {
      if (lightContent) {
        this.statusBar.styleLightContent();
      }
      else {
        this.statusBar.styleDefault();
      }
    }
  }

  public setColor(color:string) {
    if (this.platform.is("cordova")) {
      this.statusBar.backgroundColorByHexString(color);
    }
  }

  public setOverlaysWebView(overlay:boolean) {
    if (this.platform.is("cordova")) {
      this.statusBar.overlaysWebView(overlay);
    }
  }

}
