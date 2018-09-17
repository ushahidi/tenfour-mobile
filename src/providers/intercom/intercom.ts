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
      if (this.platform.is("cordova")) {
        this.logger.info(this, "initialize", "Mobile Loaded");
        resolve(true);
      }
      else if (this.environment.getIntercomAppId()) {
        this.logger.info(this, "initialize", "Web Loaded");
        require('./intercom.loader')();
        let settings = {
          app_id: this.environment.getIntercomAppId(),
          product: 'tenfour',
          alignment: 'left',
          widget: {
            "activator": "#intercom"
          }
        };
        this.logger.info(this, "initialize", "boot", settings);
        this.intercomWeb.boot(settings);
        resolve(true);
      }
      else {
        this.logger.info(this, "initialize", "Not Loaded");
        resolve(false);
      }
    });
  }

  public showMessenger(user:User):Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        let promises = [];
        if (user) {
          let options = {
            userId: 'tf' + user.id
          };
          this.logger.info(this, "showMessenger", "registerIdentifiedUser", options);
          promises.push(this.intercomNative.registerIdentifiedUser(options));
        }
        else {
          this.logger.info(this, "showMessenger", "registerUnidentifiedUser");
          promises.push(this.intercomNative.registerUnidentifiedUser({}));
        }
        Promise.all(promises).then((results:any[]) => {
          this.intercomNative.displayMessenger().then(() => {
            this.logger.info(this, "showMessenger", "displayMessenger");
            resolve(true);
          },
          (error:any) => {
            this.logger.warn(this, "showMessenger", "displayMessenger", error);
            resolve(false);
          });
        },
        (error:any) => {
          this.logger.warn(this, "showMessenger", error);
          resolve(false);
        });
      }
      else {
        resolve(false);
      }
    });
  }

  public hideMessenger():Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.intercomNative.hideMessenger().then((results:any) => {
          this.logger.info(this, "hideMessenger", results);
          resolve(true);
        },
        (error:any) => {
          this.logger.warn(this, "hideMessenger", error);
          resolve(false);
        });
      }
      else {
        resolve(false);
      }
    });
  }

  public trackLogin(organization:Organization, user:User):Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (organization && user) {
        if (this.platform.is("cordova")) {
          let attributes = {
            name: user.name,
            email: organization.email,
            created_at: user.created_at,
            user_id: user.id ? 'tf' + user.id : null,
            company: {
              id: organization.subdomain,
              name: organization.name,
              created_at: organization.created_at
            }
          };
          this.intercomNative.updateUser(attributes).then((updated:any) => {
            this.logger.info(this, "trackLogin", "updateUser", attributes, updated);
            resolve(true);
          },
          (error:any) => {
            this.logger.warn(this, "trackLogin", "updateUser", attributes, error);
            resolve(false);
          });
        }
        else if (this.intercomWeb && window.hasOwnProperty('Intercom')) {
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

  public resetUser():Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.intercomNative.reset().then((reset:any) => {
          this.logger.info(this, "resetUser", reset);
          resolve(true);
        },
        (error:any) => {
          this.logger.warn(this, "resetUser", error);
          resolve(false);
        });
      }
      else {
        resolve(false);
      }
    });
  }

}
