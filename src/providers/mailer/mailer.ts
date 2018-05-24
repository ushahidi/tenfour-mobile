import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Platform } from 'ionic-angular';
import 'rxjs/add/operator/map';

import { AppAvailability } from '@ionic-native/app-availability';

import { Country } from '../../models/country';

import { LoggerProvider } from '../../providers/logger/logger';
import { BrowserProvider } from '../../providers/browser/browser';

@Injectable()
export class MailerProvider {

  mailerApple:string = "mailto://";
  mailerAndroid:string = "com.android.email";

  constructor(
    private platform:Platform,
    private appAvailability:AppAvailability,
    private browser:BrowserProvider,
    private logger:LoggerProvider) {
  }

  public openEmail():Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.platform.is('ios')) {
        this.browser.open(this.mailerApple, '_system');
        resolve(true);
      }
      else if (this.platform.is('android')) {
        this.browser.open(this.mailerAndroid, '_system');
        resolve(true);
      }
      else {
        resolve(false);
      }
    });
  }

  public canOpenEmail():Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("ios")) {
        this.hasApp(this.mailerApple).then((yes:any) => {
          resolve(true);
        },
        (no:any) => {
          resolve(false);
        });
      }
      else if (this.platform.is("android")) {
        this.hasApp(this.mailerAndroid).then((yes:any) => {
          resolve(true);
        },
        (no:any) => {
          resolve(false);
        });
      }
      else {
        resolve(false);
      }
    });
  }

  private hasApp(app:string) {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.appAvailability.check(app).then((yes:any) => {
          resolve(true);
        },
        (no:any) => {
          resolve(false);
        });
      }
      else {
        resolve(false);
      }
    });
  }

}
