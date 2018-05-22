import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { LocalStorageService } from 'ngx-localstorage';

import { NativeStorage } from '@ionic-native/native-storage';

import { LoggerProvider } from '../../providers/logger/logger';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';

@Injectable()
export class StorageProvider {

  constructor(
    private platform:Platform,
    private webStorage:LocalStorageService,
    private nativeStorage:NativeStorage,
    private logger:LoggerProvider) {
  }

  public getOrganization():Promise<Organization> {
    return new Promise((resolve, reject) => {
      this.get("organization").then((data:any) => {
        if (data) {
          let organization = new Organization(JSON.parse(data));
          resolve(organization);
        }
        else {
          reject("No Organization");
        }
      },
      (error:any) => {
        reject("No Organization");
      });
    });
  }

  public setOrganization(organization:Organization):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.set("organization", JSON.stringify(organization)).then((saved:any) => {
        this.logger.info(this, "setOrganization", organization, "Stored");
        resolve(true);
      },
      (error:any) => {
        this.logger.error(this, "setOrganization", organization, "Failed", error);
        resolve(false);
      });
    });
  }

  public removeOrganization():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.remove("organization").then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public getUser():Promise<User> {
    return new Promise((resolve, reject) => {
      this.get("user").then((data:any) => {
        if (data) {
          let user = new User(JSON.parse(data));
          resolve(user);
        }
        else {
          reject("No User");
        }
      },
      (error:any) => {
        reject("No User");
      });
    });
  }

  public setUser(user:User):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.set("user", JSON.stringify(user)).then((saved:any) => {
        this.logger.info(this, "setUser", user, "Stored");
        resolve(true);
      },
      (error:any) => {
        this.logger.error(this, "setUser", user, "Failed", error);
        resolve(false);
      });
    });
  }

  public removeUser():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.remove("user").then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public set(key:string, value:any):Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.nativeStorage.setItem(key, value).then((data:any) => {
          resolve(data);
        },
        (error:any) => {
          reject(error);
        });
      }
      else {
        this.webStorage.asPromisable().set(key, value).then((saved:any) => {
          resolve(true);
        },
        (error:any) => {
          resolve(false);
        });
      }
    });
  }

  public get(key:string):Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.nativeStorage.getItem(key).then((data:any) => {
          resolve(data);
        },
        (error:any) => {
          reject(error);
        });
      }
      else {
        this.webStorage.asPromisable().get(key).then((data:any) => {
          resolve(data);
        },
        (error:any) => {
          resolve(null);
        });
      }
    });
  }

  public remove(key:string):Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.nativeStorage.remove(key).then((removed:any) => {
          resolve(true);
        },
        (error:any) => {
          reject(error);
        });
      }
      else {
        this.webStorage.asPromisable().remove(key).then((deleted:any) => {
          resolve(true);
        },
        (error:any) => {
          resolve(false);
        });
      }
    });
  }

}
