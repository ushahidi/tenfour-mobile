import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { ThemeableBrowser, ThemeableBrowserOptions } from '@ionic-native/themeable-browser';

import { LoggerProvider } from '../../providers/logger/logger';

@Injectable()
export class BrowserProvider {

  constructor(
    private platform:Platform,
    private themeableBrowser:ThemeableBrowser,
    private logger:LoggerProvider) {

  }

  public open(url:string, target:string="_blank", event:any=null):any {
    this.logger.info(this, "open", url, target);
    if (this.platform.is("cordova")) {
      let options:ThemeableBrowserOptions = {
        statusbar: {
          color: "#F5F5F1"
        },
          toolbar: {
          height: 44,
          color: "#F5F5F1"
        },
          title: {
          color: '#000000',
          showPageTitle: true
        },
        backButton: {
          wwwImage: 'assets/images/back.png',
          wwwImageDensity: 2,
          align: 'right',
          event: 'backPressed'
        },
        forwardButton: {
          wwwImage: 'assets/images/forward.png',
          wwwImageDensity: 2,
          align: 'right',
          event: 'forwardPressed'
        },
        closeButton: {
          wwwImage: 'assets/images/close.png',
          wwwImageDensity: 2,
          align: 'left',
          event: 'closePressed'
        },
        backButtonCanClose: true
      };
      let browser = this.themeableBrowser.create(url, target, options);
      if (this.platform.is("ios")) {
        browser.show();
      }
      if (event) {
        event.stopPropagation();
      }
      return browser;
    }
    else {
      if (event) {
        event.stopPropagation();
      }
      return window.open(url, target);
    }
  }

}
