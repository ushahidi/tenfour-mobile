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
import { Contact } from '../models/contact';
import { Organization } from '../models/organization';
import { RollCall } from '../models/rollcall';

@Injectable()
export class ApiService extends HttpService {

  api:string = null;
  clientId:string = "webapp";
  clientSecret:string = "T7913s89oGgJ478J73MRHoO2gcRRLQ";
  scope:string = "user";
  token:string = "OAuth Token";

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

  saveToken(token:Token) {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "saveToken", token);
      let json = JSON.stringify(token);
      this.storage.setItem(this.token, json).then(
        (data:any) => {
          resolve(data);
        },
        (error:any) => {
          reject(error);
        });
    });

  }

  getToken():Promise<Token> {
    return new Promise((resolve, reject) => {
      this.storage.getItem(this.token).then(
        (data:any) => {
          this.logger.info(this, "getToken", data);
          if (data) {
            let json = JSON.parse(data);
            let token:Token = <Token>json;
            let now = new Date();
            if (now > token.expires_at) {
              this.logger.info(this, "getToken", "Valid", token);
              resolve(token);
            }
            else {
              this.logger.info(this, "getToken", "Expired", token);
              this.userLogin(token.username, token.password).then(
                (token:Token) => {
                  resolve(token);
                },
                (error:any) => {
                  reject(error);
              });
            }
          }
          else {
            reject("No Token");
          }
        },
        (error:any) => {
          this.logger.error(this, "getToken", error);
          reject(error);
        });
    });
  }

  removeToken():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.storage.remove(this.token).then(
        (removed:any) => {
          resolve(true);
        },
        (error:any) => {
          reject(error);
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
          let token:Token = <Token>data;
          token.issued_at = new Date();
          if (data.expires_in) {
            token.expires_at = new Date();
            token.expires_at.setMinutes(token.expires_at.getMinutes() + data.expires_in/60);
          }
          this.saveToken(token).then(saved => {
            resolve(token);
          });
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
          let token:Token = <Token>data;
          token.username = username;
          token.password = password;
          token.issued_at = new Date();
          if (data.expires_in) {
            token.expires_at = new Date();
            token.expires_at.setMinutes(token.expires_at.getMinutes() + data.expires_in/60);
          }
          this.saveToken(token).then(saved => {
            resolve(token);
          });
        },
        (error:any) => {
          reject(error);
        })
    });
  }

  refreshLogin(refreshToken:string):Promise<Token> {
    return new Promise((resolve, reject) => {
      let url = this.api + "/oauth/access_token";
      let params = {
        grant_type: "refresh_token",
        scope: this.scope,
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret };
      this.httpPost(url, null, params).then(
        (data:any) => {
          let token:Token = <Token>data;
          token.issued_at = new Date();
          if (data.expires_in) {
            token.expires_at = new Date();
            token.expires_at.setMinutes(token.expires_at.getMinutes() + data.expires_in/60);
          }
          this.saveToken(token).then(saved => {
            resolve(token);
          });
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
            for (let attributes of data.people) {
              let person = new Person(attributes);
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
            reject("Person Not Found");
          }
        },
        (error:any) => {
          reject(error);
        });
    });
  }
  getRollCalls(token:Token, organization:Organization, limit:number=10, offset:number=0):Promise<RollCall[]> {
    return new Promise((resolve, reject) => {
      let url = this.api + `/api/v1/rollcalls/?organization=${organization.id}&limit=${limit}&offset=${offset}`;
      this.httpGet(url, token.access_token).then(
        (data:any) => {
          let rollcalls = [];
          if (data && data.rollcalls) {
            for (let attributes of data.rollcalls) {
              let rollcall = new RollCall(attributes);
              rollcalls.push(rollcall);
            }
          }
          resolve(rollcalls);
        },
        (error:any) => {
          reject(error);
        });
    });
  }

  // apiGet(url:string, params:any=null):Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this.getLogin(deployment).then((token:Token) => {
  //       this.httpGet(url, token.access_token, params).then(
  //         (data:any) => {
  //           resolve(data);
  //         },
  //         (error:any) => {
  //           reject(error);
  //         });
  //     });
  //   });
  // }
  //
  // apiPost(url:string, params:any=null):Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this.getToken().then((token:Token) => {
  //       this.httpPost(url, token.access_token, params).then(
  //         (data:any) => {
  //           resolve(data);
  //         },
  //         (error:any) => {
  //           reject(error);
  //         });
  //     });
  //   });
  // }
  //
  // apiPut(url:string, params:any=null):Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this.getToken().then((token:Token) => {
  //       this.httpPut(url, token.access_token, params).then(
  //         (data:any) => {
  //           resolve(data);
  //         },
  //         (error:any) => {
  //           reject(error);
  //         });
  //     });
  //   });
  // }
  //
  // apiDelete(deployment:Deployment, endpoint:string):Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this.getLogin(deployment).then((login:Login) => {
  //       let url = deployment.api + endpoint;
  //       this.httpDelete(url, login.access_token).then(
  //         (data:any) => {
  //           resolve(data);
  //         },
  //         (error:any) => {
  //           reject(error);
  //         });
  //     });
  //   });
  // }

}
