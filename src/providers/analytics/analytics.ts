import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { SegmentService } from 'ngx-segment-analytics';

import { Device } from '@ionic-native/device';
import { AppVersion } from '@ionic-native/app-version';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';

import { LoggerProvider } from '../../providers/logger/logger';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { EnvironmentProvider } from '../../providers/environment/environment';

@Injectable()
export class AnalyticsProvider {

  constructor(
    private platform:Platform,
    private device:Device,
    private appVersion:AppVersion,
    private segment:SegmentService,
    private logger:LoggerProvider,
    private firebase:FirebaseProvider,
    private environment:EnvironmentProvider) {
  }

  public initialize() {
    return new Promise((resolve, reject) => {
      this.platform.ready().then(() => {
        this.segment.ready().then((ready:SegmentService) => {
          this.logger.info(this, "initialize", "Initialized");
          if (this.platform.is("cordova")) {
            this.segment.debug(this.device.isVirtual);
          }
          else {
            this.segment.debug(this.environment.isProduction() == false);
          }
          resolve(true);
        },
        (error:any) => {
          this.logger.warn(this, "initialize", "Failed", error);
          resolve(false);
        });
      });
    });
  }

  public trackLogin(organization:Organization, user:User):Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (organization && user) {
        Promise.all([
          this.getAppName(),
          this.getDeviceName()]).then((results:string[]) => {
          let traits = {
            app: results[0],
            device: results[1],
            organization: organization.name,
            person: user.name,
            email: organization.email
          };
          this.trackIdentify(user.id, traits).then(() => {
            this.logger.info(this, "trackLogin", user, "Tracked", traits || "");
            resolve(true);
          },
          (error) => {
            this.logger.warn(this, "trackLogin", error, "Failed");
            resolve(false);
          });
        });
      }
      else {
        this.logger.info(this, "trackLogin", "Skipped");
        resolve(false);
      }
    });
  }

  public trackIdentify(userId:any, traits:any=null):Promise<boolean> {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.segment.identify("" + userId, traits),
        this.firebase.logUser("" + userId, traits)]).then((results:any) => {
        this.logger.info(this, "trackIdentify", userId, "Tracked", traits || "");
        resolve(true);
      },
      (error:any) => {
        this.logger.warn(this, "trackIdentify", userId, "Failed", error);
        resolve(false);
      });
    });
  }

  public trackPage(page:any, properties:any=null):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.getPageName(page).then((pageName:string) => {
        Promise.all([
          this.segment.page(pageName, properties),
          this.firebase.logPage(pageName, properties)]).then((results:any) => {
          this.logger.info(this, "trackPage", pageName, "Tracked", properties || "");
          resolve(true);
        },
        (error:any) => {
          this.logger.warn(this, "trackPage", pageName, "Failed", error);
          resolve(false);
        });
      });
    });
  }

  public trackEvent(event:string, properties:any=null):Promise<boolean> {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.segment.track(event, properties),
        this.firebase.logEvent(event, properties)]).then((results:any) => {
        this.logger.info(this, "trackEvent", event, "Tracked", properties || "");
        resolve(true);
      },
      (error:any) => {
        this.logger.warn(this, "trackEvent", event, "Failed", error);
        resolve(false);
      });
    });
  }

  public trackError(message:string):Promise<boolean> {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.firebase.logError(message)]).then((results:any) => {
        this.logger.info(this, "trackError", message, "Tracked");
        resolve(true);
      },
      (error:any) => {
        this.logger.warn(this, "trackError", message, "Failed", error);
        resolve(false);
      });
    });
  }

  private getAppName():Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        Promise.all([
          this.appVersion.getAppName(),
          this.appVersion.getVersionNumber()]).then((results:string[]) => {
            resolve(`${results[0]} ${results[1]}`);
          },
          (error:any) => {
            resolve("TenFour");
          });
      }
      else {
        resolve("TenFour");
      }
    });
  }

  private getDeviceName():Promise<string> {
    return new Promise((resolve, reject) => {
      let name = [];
      if (this.platform.is("cordova")) {
        if (this.device.manufacturer) {
          name.push(this.device.manufacturer);
        }
        if (this.device.platform) {
          name.push(this.device.platform);
        }
        if (this.device.version) {
          name.push(this.device.version);
        }
        if (this.device.model) {
          name.push(this.device.model);
        }
      }
      else {
        name.push(navigator.appVersion);
      }
      resolve(name.join(" "));
    });
  }

  private getPageName(page:any):Promise<string> {
    return new Promise((resolve, reject) => {
      let pageName = page.constructor.name
        .replace('Page', '')
        .replace(/([A-Z])/g, function(match) {
          return " " + match;
        })
        .replace(/^./, function(match) {
          return match.toUpperCase();
        })
        .trim();
      resolve(pageName);
    });
  }

}
