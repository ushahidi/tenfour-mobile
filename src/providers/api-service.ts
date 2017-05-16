import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Http } from '@angular/http';

import { Transfer} from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { NativeStorage } from '@ionic-native/native-storage';
import { IsDebug } from '@ionic-native/is-debug';

import { HttpService } from '../providers/http-service';
import { LoggerService } from '../providers/logger-service';
import { DatabaseService } from '../providers/database-service';

import { Token } from '../models/token';
import { Email } from '../models/email';
import { Person } from '../models/person';
import { Organization } from '../models/organization';

@Injectable()
export class ApiService extends HttpService {

  api:string = null;
  clientId:string = "webapp";
  clientSecret:string = "T7913s89oGgJ478J73MRHoO2gcRRLQ";
  scope:string = "user";

  constructor(
    protected platform:Platform,
    protected http:Http,
    protected file:File,
    protected transfer:Transfer,
    protected logger:LoggerService,
    protected storage:NativeStorage,
    protected database:DatabaseService,
    protected isDebug:IsDebug) {
    super(http, file, transfer, logger);
    this.platform.ready().then(() => {
      this.isDebug.getIsDebug().then(
        (debug:boolean) => {
          if (debug) {
            this.api = "/api.staging.rollcall.io";
          }
          else {
            this.api = "https://api.staging.rollcall.io";
          }
        },
        (error:any) => {
          this.api = "https://api.staging.rollcall.io";
        });
    });
  }

  clientLogin():Promise<Token> {
    return new Promise((resolve, reject) => {
      let url = this.api + "/oauth/access_token";
      let params = {
        grant_type: "client_credentials",
        scope: this.scope,
        client_id: this.clientId,
        client_secret: this.clientSecret };
      this.httpPost(url, null, params).then(
        (data:any) => {
          let token = new Token(data);
          resolve(token);
        },
        (error:any) => {
          reject(error);
        })
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
          let token = new Token(data);
          resolve(token);
        },
        (error:any) => {
          reject(error);
        })
    });
  }

  checkEmail(email:string):Promise<Email> {
    return new Promise((resolve, reject) => {
      let url = this.api + "/verification/email";
      let params = {
        address: email };
      this.httpGet(url, null, params).then(
        (data:any) => {
          let email = new Email(data);
          resolve(email);
        },
        (error:any) => {
          reject(error);
        });
    });
  }

  registerEmail(email:string):Promise<Email> {
    return new Promise((resolve, reject) => {
      let url = this.api + "/verification/email";
      let params = {
        address: email };
      this.httpPost(url, null, params).then(
        (data:any) => {
          let email = new Email(data);
          resolve(email);
        },
        (error:any) => {
          reject(error);
        });
    });
  }

  getOrganizations(subdomain:string=null, name:string=null):Promise<Organization[]> {
    return new Promise((resolve, reject) => {
      let params = { };
      if (name) {
        params['name'] = name;
      }
      if (subdomain) {
        params['subdomain'] = subdomain;
      }
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

  createOrganization(token:Token, organization:Organization):Promise<Organization> {
    return new Promise((resolve, reject) => {
      let url = this.api + "/api/v1/organizations";
      let params = {
        name: organization.user_name,
        email: organization.email,
        password: organization.password,
        subdomain: organization.subdomain,
        organization_name: organization.name };
      this.httpPost(url, token.access_token, params).then(
        (data:any) => {
          let organization:Organization = new Organization(data);
          resolve(organization);
        },
        (error:any) => {
          reject(error);
        });
    });
  }

  getPeople(token:Token, organization:Organization):Promise<Person[]> {
    return new Promise((resolve, reject) => {
      let url = this.api + `/api/v1/organizations/${organization.id}/people/`;
      this.httpGet(url, token.access_token).then(
        (data:any) => {
          let people = [];
          if (data && data.people) {
            for (let item of data.people) {
              let person = new Person(item);
              people.push(person);
            }
          }
          resolve(people);
        },
        (error:any) => {
          reject(error);
        });
    });
  }

  getPerson(token:Token, organization:Organization, id:any="me"):Promise<Person> {
    return new Promise((resolve, reject) => {
      let url = this.api + `/api/v1/organizations/${organization.id}/people/${id}`;
      this.httpGet(url, token.access_token).then(
        (data:any) => {
          if (data && data.person) {
            let person = new Person(data.person);
            resolve(person);
          }
          else {
            reject("Not Found");
          }
        },
        (error:any) => {
          reject(error);
        });
    });
  }

}
