import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { Observable } from "rxjs/Observable"
import 'rxjs/add/observable/of';

import { Firebase } from '@ionic-native/firebase';

import { LoggerProvider } from '../../providers/logger/logger';
import { StorageProvider } from '../../providers/storage/storage';

@Injectable()
export class FirebaseProvider {

  private token:string=null;

  constructor(
    private platform:Platform,
    private firebase:Firebase,
    private logger:LoggerProvider,
    private storage:StorageProvider) {
  }

  public initialize():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "initialize");
      if (this.platform.is("cordova")) {
        this.getToken().then((token:string) => {
          this.logger.info(this, "initialize", token);
          this.storage.setFirebase(token).then((stored:boolean) => {
            resolve(true);
          },
          (error:any) => {
            resolve(false);
          });
        },
        (error:any) => {
          this.logger.error(this, "initialize", error);
          this.storage.removeFirebase().then((removed:boolean) => {
            resolve(false);
          },
          (error:any) => {
            resolve(false);
          });
        });
      }
      else {
        resolve(false);
      }
    });
  }

  public hasPermission():Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.firebase.hasPermission().then((data:any) => {
          resolve(data.isEnabled);
        },
        (error:any) => {
          resolve(false);
        });
      }
      else {
        resolve(false);
      }
    });
  }

  public grantPermission():Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.firebase.grantPermission().then((permission:any) => {
          resolve(permission);
        },
        (error:any) => {
          resolve(null);
        });
      }
      else {
        resolve(null);
      }
    });
  }

  public getToken():Promise<string> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "getToken");
      if (this.platform.is("cordova")) {
        if (this.token) {
          this.logger.info(this, "getToken", this.token, "Cached");
          resolve(this.token);
        }
        else {
          this.firebase.getToken().then((token:string) => {
            this.logger.info(this, "getToken", token);
            this.token = token;
            resolve(token);
          },
          (error:any) => {
            this.logger.error(this, "getToken", error);
            this.token = null;
            resolve(null);
          });
        }
      }
      else {
        resolve(null);
      }
    });
  }

  public freshToken():Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.firebase.onTokenRefresh().subscribe((token:string) => {
          this.logger.info(this, "freshToken", token);
          this.token = token;
          resolve(token);
        });
      }
      else {
        resolve(null);
      }
    });
  }

  public onNotification():Observable<any> {
    if (this.platform.is("cordova")) {
      this.firebase.onNotificationOpen().subscribe((data:any) => {
        this.logger.info(this, "onNotification", data);
        return Observable.of(data);
      });
    }
    return Observable.of(null);
  }

}
