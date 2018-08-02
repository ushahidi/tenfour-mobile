import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { Observable } from "rxjs/Observable"
import 'rxjs/add/observable/of';

import { Firebase as FirebaseNative } from '@ionic-native/firebase';
import { FirebaseApp as FirebaseWeb } from 'angularfire2';
import 'firebase/messaging';

import { LoggerProvider } from '../../providers/logger/logger';
import { StorageProvider } from '../../providers/storage/storage';

@Injectable()
export class FirebaseProvider {

  private firebaseMessaging:any = null;

  constructor(
    private platform:Platform,
    private firebaseNative:FirebaseNative,
    private firebaseWeb:FirebaseWeb,
    private logger:LoggerProvider,
    private storage:StorageProvider) {
    this.firebaseMessaging = firebaseWeb.messaging();
  }

  public initialize():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.platform.ready().then(() => {
        if (this.platform.is("cordova")) {
          this.getToken().then((token:string) => {
            this.logger.info(this, "initialize", token);
            resolve(token != null);
          },
          (error:any) => {
            this.logger.warn(this, "initialize", error);
            resolve(false);
          });
        }
        else {
          navigator.serviceWorker.register('service-worker.js').then((registration) => {
            this.firebaseMessaging.useServiceWorker(registration);
            this.getToken().then((token:string) => {
              this.logger.info(this, "initialize", token);
              resolve(token != null);
            },
            (error:any) => {
              this.logger.warn(this, "initialize", error);
              resolve(false);
            });
          });
        }
      });
    });
  }

  public hasPermission():Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.firebaseNative.hasPermission().then((data:any) => {
          this.logger.info(this, "hasPermission", data);
          resolve(data && data.isEnabled);
        },
        (error:any) => {
          this.logger.warn(this, "hasPermission", error);
          resolve(false);
        });
      }
      else {
        this.firebaseMessaging.getToken().then((token:any) => {
          this.logger.info(this, "hasPermission", token != null);
          resolve(token != null);
        },
        (error:any) => {
          this.logger.warn(this, "hasPermission", error);
          resolve(false);
        });
      }
    });
  }

  public requestPermission():Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.firebaseNative.grantPermission().then((permission:any) => {
          this.logger.info(this, "requestPermission", permission);
          resolve(permission);
        },
        (error:any) => {
          this.logger.warn(this, "requestPermission", error);
          resolve(null);
        });
      }
      else {
        this.firebaseMessaging.requestPermission().then((permission:any) => {
          this.logger.info(this, "requestPermission", permission);
          resolve(permission);
        },
        (error:any) => {
          this.logger.warn(this, "requestPermission", error);
          resolve(null);
        });
      }
    });
  }

  public getToken():Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.firebaseNative.getToken().then((token:string) => {
          this.logger.info(this, "getToken", token, "Fetched");
          this.storage.setFirebase(token).then((stored:boolean) => {
            resolve(token);
          },
          (error:any) => {
            resolve(token);
          });
        },
        (error:any) => {
          this.logger.warn(this, "getToken", "Failed", error);
          this.storage.removeFirebase().then((removed:boolean) => {
            resolve(null);
          },
          (error:any) => {
            resolve(null);
          });
        });
      }
      else {
        this.promiseTimeout(this.firebaseMessaging.getToken(), 2000).then((token:string) => {
          this.logger.info(this, "getToken", token, "Fetched");
          this.storage.setFirebase(token).then((stored:boolean) => {
            resolve(token);
          },
          (error:any) => {
            resolve(token);
          });
        },
        (error:any) => {
          this.logger.warn(this, "getToken", "Failed", error);
          this.storage.removeFirebase().then((removed:boolean) => {
            resolve(null);
          },
          (error:any) => {
            resolve(null);
          });
        });
      }
    });
  }

  public freshToken():Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.firebaseNative.onTokenRefresh().subscribe((token:string) => {
          this.logger.info(this, "freshToken", token, "Refreshed");
          this.storage.setFirebase(token).then((stored:boolean) => {
            resolve(token);
          },
          (error:any) => {
            resolve(null);
          });
        });
      }
      else {
        this.firebaseMessaging.onTokenRefresh().subscribe((token:string) => {
          this.logger.info(this, "freshToken", token, "Refreshed");
          this.storage.setFirebase(token).then((stored:boolean) => {
            resolve(token);
          },
          (error:any) => {
            resolve(null);
          });
        });
      }
    });
  }

  public onNotification():Observable<any> {
    if (this.platform.is("cordova")) {
      this.firebaseNative.onNotificationOpen().subscribe((data:any) => {
        this.logger.info(this, "onNotification", data);
        return Observable.of(data);
      });
    }
    else {
      this.firebaseMessaging.onMessage((data:any) => {
        this.logger.info(this, "onNotification", data);
        return Observable.of(data);
      });
    }
    return Observable.of(null);
  }

  public logUser(userId:string, properties:any=null):Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.firebaseNative.setUserId(userId).then((tracked:any) => {
          let updates = [];
          if (properties) {
            for (let key in properties) {
              let value = properties[key];
              updates.push(this.firebaseNative.setUserProperty(key, value));
            }
          }
          Promise.all(updates).then((updated:any) => {
            this.logger.info(this, "logUser", userId, "Logged", properties || "");
            resolve(true);
          },
          (error:any) => {
            this.logger.warn(this, "logUser", userId, "Failed", error);
            resolve(false);
          });
        },
        (error:any) => {
          this.logger.warn(this, "logUser", userId, "Failed", error);
          resolve(false);
        });
      }
      else {
        this.logger.info(this, "logUser", userId, "Skipped");
        resolve(false);
      }
    });
  }

  public logPage(page:string, properties:any=null):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "logPage", page);
      if (this.platform.is("cordova")) {
        this.firebaseNative.setScreenName(page).then((tracked:any) => {
          this.logger.info(this, "logPage", page, "Logged", properties || "");
          resolve(true);
        },
        (error:any) => {
          this.logger.warn(this, "logPage", page, "Failed", error);
          resolve(false);
        });
      }
      else {
        this.logger.info(this, "logPage", page, "Skipped");
        resolve(false);
      }
    });
  }

  public logEvent(event:string, properties:any=null):Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.logger.info(this, "logEvent", event);
        this.firebaseNative.logEvent(event, properties).then((tracked:any) => {
          this.logger.info(this, "logEvent", event, "Logged", properties || "");
          resolve(true);
        },
        (error:any) => {
          this.logger.warn(this, "logEvent", event, "Failed", error);
          resolve(false);
        });
      }
      else {
        this.logger.info(this, "logEvent", event, "Skipped");
        resolve(false);
      }
    });
  }

  public logError(message:string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.logger.info(this, "logError", message);
        this.firebaseNative.logError(message).then((tracked:any) => {
          this.logger.info(this, "logError", message, "Logged");
          resolve(true);
        },
        (error:any) => {
          this.logger.warn(this, "logError", message, "Failed", error);
          resolve(false);
        });
      }
      else {
        this.logger.info(this, "logError", message, "Skipped");
        resolve(false);
      }
    });
  }

  private promiseTimeout(promise:Promise<any>, milliseconds:number=1000) {
    return new Promise((resolve, reject) => {
      var timer = setTimeout(() => {
        reject("Promise Timeout");
      }, milliseconds);
      promise.then((result:any) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error:any) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  }

}
