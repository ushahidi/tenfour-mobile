import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Transfer} from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { NativeStorage } from '@ionic-native/native-storage';
import { IsDebug } from '@ionic-native/is-debug';

import { HttpService } from '../providers/http-service';
import { LoggerService } from '../providers/logger-service';
import { DatabaseService } from '../providers/database-service';

import { Token } from '../models/token';
import { Organization } from '../models/organization';

@Injectable()
export class ApiService extends HttpService {

  api:string = null;
  clientId:string = "webapp";
  clientSecret:string = "T7913s89oGgJ478J73MRHoO2gcRRLQ";
  scope:string = "user";

  constructor(
    protected http:Http,
    protected file:File,
    protected transfer:Transfer,
    protected logger:LoggerService,
    protected storage:NativeStorage,
    protected database:DatabaseService,
    protected isDebug:IsDebug) {
    super(http, file, transfer, logger);
    this.isDebug.getIsDebug().then(
      (isDebug:boolean) => {
        if (isDebug) {
          this.api = "/api.staging.rollcall.io";
        }
        else {
          this.api = "https://api.staging.rollcall.io";
        }
      },
      (error:any) => {
        this.api = "https://api.staging.rollcall.io";
      });
  }

  searchOrganizations(subdomain:string):Promise<Organization[]> {
    return new Promise((resolve, reject) => {
      let params = {
        subdomain: subdomain
      };
      let url = this.api + "/api/v1/organizations";
      this.httpGet(url, null, params).then(
        (data:any) => {
          if (data.organizations && data.organizations.length > 0) {
            let organizations = [];
            for (let attributes of data.organizations) {
              let organization = new Organization(attributes);
              organizations.push(organization);
            }
            resolve(organizations);
          }
          else {
            resolve([]);
          }
        },
        (error:any) => {
          reject(error);
        });
    });
  }

  userLogin(username:string, password:string):Promise<Token> {
    return new Promise((resolve, reject) => {
      let url = this.api + "/oauth/access_token";
      let params = {
        grant_type: "password",
        scope: this.scope,
        username: username,
        password: password,
        client_id: this.clientId,
        client_secret: this.clientSecret };
      this.httpPost(url, null, params).then(
        (data:any) => {
          let token:Token = new Token(data);
          resolve(token);
        },
        (error:any) => {
          reject(error);
        });
    });
  }

}
