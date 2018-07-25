import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { Intercom as IntercomWeb } from 'ng-intercom';
import { Intercom as IntercomNative } from '@ionic-native/intercom';

import { Device } from '@ionic-native/device';
import { AppVersion } from '@ionic-native/app-version';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';

import { LoggerProvider } from '../../providers/logger/logger';
import { EnvironmentProvider } from '../../providers/environment/environment';

@Injectable()
export class IntercomProvider {

  constructor(
    private platform:Platform,
    private device:Device,
    private appVersion:AppVersion,
    private logger:LoggerProvider,
    private environment:EnvironmentProvider,
    private intercomWeb:IntercomWeb,
    private intercomNative:IntercomNative) {
  }

  public initialize():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "initialize");
      if (this.environment.getIntercomAppId()) {
        if (this.platform.is("cordova")) {
          this.intercomNative.setLauncherVisibility('VISIBLE').then((visible:any) => {
            this.logger.info(this, "initialize", "setLauncherVisibility", visible);
            resolve(true);
          },
          (error:any) => {
            this.logger.error(this, "initialize", "setLauncherVisibility", error);
            resolve(false);
          });
        }
        else {
          require('./intercom.loader')();
          let settings = {
            app_id: this.environment.getIntercomAppId(),
            alignment: 'left',
            widget: {
              "activator": "#intercom"
            }
          };
          this.logger.info(this, "initialize", "boot", settings);
          this.intercomWeb.boot(settings);
          resolve(true);
        }
      }
      else {
        resolve(false);
      }
    });
  }

  public trackLogin(organization:Organization, user:User):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "trackLogin");
      if (organization && user) {
        let attributes = {
          name: user.name,
          email: organization.email,
          created_at: user.created_at,
          user_id: user.id ? 'tf' + user.id : undefined,
          company: {
            id: organization.subdomain,
            name: organization.name,
            created_at: organization.created_at
          },
          alignment: 'left'
        };
        if (this.platform.is("cordova")) {
          this.intercomNative.updateUser(attributes).then((updated:any) => {
            this.logger.info(this, "trackLogin", attributes, updated);
            resolve(true);
          },
          (error:any) => {
            this.logger.error(this, "trackLogin", attributes, error);
            resolve(false);
          });
        }
        else {
          this.logger.info(this, "trackLogin", attributes);
          this.intercomWeb.update(attributes);
          resolve(true);
        }
      }
      else {
        resolve(false);
      }
    });
  }

}
