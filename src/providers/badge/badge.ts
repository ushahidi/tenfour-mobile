import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { Badge } from '@ionic-native/badge';

import { LoggerProvider } from '../../providers/logger/logger';

@Injectable()
export class BadgeProvider {

  constructor(
    private platform:Platform,
    private badge:Badge,
    private logger:LoggerProvider) {
  }

  public clear():Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        return this.badge.clear();
      }
      else {
        resolve(false);
      }
    });
  }
  public setBadgeNumber(badgeNumber:number):Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.badge.requestPermission().then((permission:any) => {
          this.logger.info(this, "setBadgeNumber", badgeNumber, "Permission", permission);
          if (badgeNumber > 0) {
            this.badge.set(badgeNumber).then((result:any) => {
              this.logger.info(this, "setBadgeNumber", badgeNumber, "Set", result);
              resolve(true);
            },
            (error:any) => {
              this.logger.error(this, "setBadgeNumber", badgeNumber, "Error", error);
              resolve(false);
            });
          }
          else {
            this.badge.clear().then((cleared:boolean) => {
              this.logger.info(this, "setBadgeNumber", badgeNumber, "Clear", cleared);
              resolve(false);
            },
            (error:any) => {
              this.logger.error(this, "setBadgeNumber", badgeNumber, "Error", error);
              resolve(false);
            });
          }
        });
      }
      else {
        resolve(false);
      }
    });
  }

}
