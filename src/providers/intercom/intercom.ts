import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { Intercom } from 'ng-intercom';

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
    public intercom:Intercom) {
  }

  public initialize() {
    if (!this.environment.getIntercomAppId()) {
      return this.logger.warn(this, 'Skipping Intercom initialization - no app id.');  
    }

    this.logger.info(this, 'Initializing Intercom');

    require('./intercom.loader')();

    this.intercom.boot({
      app_id: this.environment.getIntercomAppId(),
      // product: 'TenFour',
      alignment: 'left',
      widget: {
        "activator": "#intercom"
      }
    });
  }

  public trackLogin(organization:Organization, user:User) {
    if (organization && user && this.intercom) {
      this.intercom.update({
        name: user.name,
        email: organization.email,
        // phone: phone,
        created_at: user.created_at,
        user_id: user.id ? 'tf' + user.id : undefined,
        company: {
          id: organization.subdomain,
          name: organization.name,
          created_at: organization.created_at
        },
        alignment: 'left'
      });
    }
  }

}
