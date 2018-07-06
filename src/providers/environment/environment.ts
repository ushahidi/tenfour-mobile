import { Injectable } from '@angular/core';

import { Environment } from "@app/env";

import { LoggerProvider } from '../../providers/logger/logger';

@Injectable()
export class EnvironmentProvider {

  private environment:any;

  constructor(private logger:LoggerProvider) {
    this.environment = Environment;
    this.logger.info("Environment", this.environment);
  }

  public getEnvironmentName():string {
    return this.environment.environmentName;
  }

  public getApiEndpoint():string {
    return this.environment.apiEndpoint;
  }

  public getClientId():string {
    return this.environment.clientId;
  }

  public getClientSecret():string {
    return this.environment.clientSecret;
  }

  public getAppDomain():string {
    return this.environment.appDomain;
  }

  public getIntercomAppId():string {
    return this.environment.intercomAppId;
  }

}
