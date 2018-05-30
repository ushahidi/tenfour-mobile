import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { SegmentService } from 'ngx-segment-analytics';

import { Device } from '@ionic-native/device';
import { AppVersion } from '@ionic-native/app-version';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';

import { LoggerProvider } from '../../providers/logger/logger';

@Injectable()
export class AnalyticsProvider {

  constructor(
    private platform:Platform,
    private device:Device,
    private appVersion:AppVersion,
    private segment:SegmentService,
    private logger:LoggerProvider) {

  }

  public initialize() {
    return this.segment.ready().then((ready:SegmentService) => {
      if (this.platform.is("cordova")) {
        this.segment.debug(this.device.isVirtual);
      }
    });
  }

  public trackLogin(organization:Organization, user:User) {
    if (organization && user) {
      this.trackIdentify(user.id, {
        app: this.appName(),
        device: this.deviceName(),
        organization: organization.name,
        person: user.name,
        email: organization.email
      });
    }
  }

  public trackIdentify(user:any, traits:any=null):Promise<any> {
    return this.segment.identify("" + user, traits).then(() => {
      this.logger.info(this, "trackIdentify", user, traits, "Posted");
    },
    (error:any) => {
      this.logger.error(this, "trackIdentify", user, traits, "Failed", error);
    });
  }

  public trackPage(page:any, properties:any=null):Promise<any> {
    let name = this.pageName(page);
    return this.segment.page(name, properties).then(() => {
      this.logger.info(this, "trackPage", name, properties, "Posted");
    },
    (error:any) => {
      this.logger.error(this, "trackPage", name, properties, "Failed", error);
    });
  }

  public trackEvent(event:string, properties:any=null):Promise<any> {
    return this.segment.track(event, properties).then(() => {
      this.logger.info(this, "trackEvent", event, "Posted");
    },
    (error:any) => {
      this.logger.error(this, "trackPage", event, "Failed", error);
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
