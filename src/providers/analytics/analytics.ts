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
      this.segment.ready().then((ready:SegmentService) => {
        if (this.platform.is("cordova")) {
          this.segment.debug(this.device.isVirtual);
        }
        else {
          this.segment.debug(this.environment.isProduction() == false);
        }
        resolve(true);
      });
    });
  }

  public trackLogin(organization:Organization, user:User):Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (organization && user) {
        let traits = {
          app: this.appName(),
          device: this.deviceName(),
          organization: organization.name,
          person: user.name,
          email: organization.email
        };
        this.trackIdentify(user.id, traits).then(() => {
          this.logger.info(this, "trackLogin", user, traits || "", "Posted");
          resolve(true);
        },
        (error) => {
          this.logger.warn(this, "trackLogin", error, "Failed");
          resolve(false);
        });
      }
      else {
        resolve(false);
      }
    });
  }

  public trackIdentify(userId:any, traits:any=null):Promise<boolean> {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.segment.identify("" + userId, traits),
        this.firebase.logUser("" + userId, traits)]).then((results:any) => {
        this.logger.info(this, "trackIdentify", userId, traits || "", "Posted");
        resolve(true);
      },
      (error:any) => {
        this.logger.warn(this, "trackIdentify", userId, traits || "", "Failed", error);
        resolve(false);
      });
    });
  }

  public trackPage(page:any, properties:any=null):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let name = this.pageName(page);
      Promise.all([
        this.segment.page(name, properties),
        this.firebase.logPage(name, properties)]).then((results:any) => {
        this.logger.info(this, "trackPage", name, properties || "", "Posted");
        resolve(true);
      },
      (error:any) => {
        this.logger.warn(this, "trackPage", name, properties || "", "Failed", error);
        resolve(false);
      });
    });
  }

  public trackEvent(event:string, properties:any=null):Promise<boolean> {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.segment.track(event, properties),
        this.firebase.logEvent(event, properties)]).then((results:any) => {
        this.logger.info(this, "trackEvent", event, properties || "", "Posted");
        resolve(true);
      },
      (error:any) => {
        this.logger.warn(this, "trackEvent", event, properties || "", "Failed", error);
        resolve(false);
      });
    });
  }

  public trackError(message:string):Promise<boolean> {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.firebase.logError(message)]).then((results:any) => {
        this.logger.info(this, "trackError", message, "Posted");
        resolve(true);
      },
      (error:any) => {
        this.logger.warn(this, "trackError", message, "Failed", error);
        resolve(false);
      });
    });
  }

  private appName():string {
    if (this.platform.is("cordova")) {
      return `${this.appVersion.getAppName()} ${this.appVersion.getVersionNumber()}`;
    }
    return "TenFour";
  }

  private deviceName():string {
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
    return name.join(" ");
  }

  private pageName(page:any):string {
    return page.constructor.name
      .replace('Page', '')
      .replace(/([A-Z])/g, function(match) {
        return " " + match;
      })
      .replace(/^./, function(match) {
        return match.toUpperCase();
      })
      .trim();
  }

}
