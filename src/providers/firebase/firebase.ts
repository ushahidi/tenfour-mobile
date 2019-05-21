import { Injectable } from '@angular/core';
import { Platform, Events } from 'ionic-angular';

import { Observable } from "rxjs/Observable"
import 'rxjs/add/observable/of';

import { Environment as ENVIRONMENT } from "@app/env";

import { Firebase as FirebaseNative } from '@ionic-native/firebase';

import firebase from 'firebase/app';
import 'firebase/messaging';

import { LoggerProvider } from '../../providers/logger/logger';
import { StorageProvider } from '../../providers/storage/storage';

import {
  EVENT_CHECKIN_DETAILS,
  EVENT_CHECKIN_CREATED,
  EVENT_CHECKIN_UPDATED,
  EVENT_FIREBASE_TOKEN } from '../../constants/events';

@Injectable()
export class FirebaseProvider {

  private firebaseWeb:any = null;
  private token:string = null;

  constructor(
    private platform:Platform,
    private events:Events,
    private firebaseNative:FirebaseNative,
    private logger:LoggerProvider,
    private storage:StorageProvider) {
  }

  public initialize():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.platform.ready().then(() => {
        if (this.platform.is("cordova")) {
          this.logger.info(this, "initialize", "cordova");
          this.getToken().then((token:string) => {
            resolve(token != null);
          },
          (error:any) => {
            resolve(false);
          });
        }
        else if ('serviceWorker' in navigator) {
          try {
            firebase.initializeApp({
              appId: ENVIRONMENT.firebaseAppId,
              projectId: ENVIRONMENT.firebaseProjectId,
              apiKey: ENVIRONMENT.firebaseApiKey,
              messagingSenderId: ENVIRONMENT.firebaseSenderId
            });
            this.firebaseWeb = firebase.messaging();
            navigator.serviceWorker.register('/service-worker.js').then((registration) => {
              this.logger.info(this, "initialize", "serviceWorker", registration);
              this.firebaseWeb.useServiceWorker(registration);
              this.getToken().then((token:string) => {
                resolve(token != null);
              },
              (error:any) => {
                resolve(false);
              });
            });
          }
          catch (error) {
            this.logger.warn(this, "initialize", "Firebase not supported in your browser");
          }
        }
        else {
          this.logger.warn(this, "initialize", "Not Loaded");
          resolve(false);
        }
      });
    });
  }

  public getToken():Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.firebaseNative.grantPermission()
          .then((permission:any) => {
            this.logger.info(this, "getToken", "permission", permission);
            return this.firebaseNative.getToken();
          })
          .then((token:string) => {
            this.logger.info(this, "getToken", "token", token);
            this.token = token;
            return this.storage.setFirebase(token);
          })
          .then((stored:boolean) => {
            this.logger.info(this, "getToken", "storage", stored);
            this.events.publish(EVENT_FIREBASE_TOKEN, this.token);
            resolve(this.token);
          })
          .catch((error:any) => {
            this.logger.error(this, "getToken", error);
            resolve(null);
          });
      }
      else if (this.firebaseWeb) {
        this.logger.info(this, "getToken", "serviceWorker");
        this.firebaseWeb.requestPermission()
          .then((permission:any) => {
            this.logger.info(this, "getToken", "permission", permission);
            return this.firebaseWeb.getToken();
          })
          .then((token:string) => {
            this.logger.info(this, "getToken", "token", token);
            this.token = token;
            return this.storage.setFirebase(token);
          })
          .then((stored:boolean) => {
            this.logger.info(this, "getToken", "storage", stored);
            this.events.publish(EVENT_FIREBASE_TOKEN, this.token);
            resolve(this.token);
          })
          .catch((error:any) => {
            this.logger.error(this, "getToken", error);
            resolve(null);
          });
      }
      else {
        this.logger.warn(this, "getToken", "Browser does not support notifications");
        resolve(null);
      }
    });
  }

  public removeToken():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.storage.getFirebase().then((token:string) => {
        if (token && token.length > 0) {
          if (this.platform.is("cordova")) {
            resolve(false);
          }
          else {
            this.firebaseWeb.deleteToken(token).then((deleted:any) => {
              this.logger.info(this, "removeToken", "Removed");
              resolve(true);
            },
            (error:any) => {
              this.logger.error(this, "removeToken", "deleteToken", error);
              resolve(false);
            });
          }
        }
        else {
          this.logger.warn(this, "removeToken", "No Token");
          resolve(false);
        }
      },
      (error:any) => {
        this.logger.error(this, "removeToken", error);
        resolve(false);
      });
    });
  }

  public subscribeNotifications() {
    if (this.platform.is("cordova")) {
      this.logger.info(this, "subscribeNotifications", "cordova");
      this.firebaseNative.onNotificationOpen().subscribe((data:any) => {
        this.logger.info(this, "subscribeNotifications", data);
        if (data && data.notification) {
          this.publishEvent(data.notification);
        }
      });
      this.firebaseNative.onTokenRefresh().subscribe(() => {
        this.logger.info(this, "subscribeNotifications", "onTokenRefresh");
        this.firebaseNative.getToken()
          .then((token:string) => {
            this.logger.info(this, "subscribeNotifications", "onTokenRefresh", "getToken", token);
            this.token = token;
            return this.storage.setFirebase(token);
          })
          .then((stored:boolean) => {
            this.logger.info(this, "subscribeNotifications", "onTokenRefresh", "setFirebase", stored);
            this.events.publish(EVENT_FIREBASE_TOKEN, this.token);
          })
          .catch((error:any) => {
            this.logger.error(this, "subscribeNotifications", "onTokenRefresh", "getToken", error);
          });
      });
    }
    else if (this.firebaseWeb) {
      this.logger.info(this, "subscribeNotifications", "serviceWorker");
      this.firebaseWeb.onMessage((data:any) => {
        this.logger.info(this, "subscribeNotifications", "onMessage", data);
        if (data && data.notification) {
          this.publishEvent(data.notification);
        }
      },
      (error:any) => {
        this.logger.error(this, "subscribeNotifications", "onMessage", error);
      });
      this.firebaseWeb.onTokenRefresh(() => {
        this.logger.info(this, "subscribeNotifications", "onTokenRefresh");
        this.firebaseNative.getToken()
          .then((token:string) => {
            this.logger.info(this, "subscribeNotifications", "onTokenRefresh", "getToken", token);
            this.token = token;
            return this.storage.setFirebase(token);
          })
          .then((stored:boolean) => {
            this.logger.info(this, "subscribeNotifications", "onTokenRefresh", "setFirebase", stored);
            this.events.publish(EVENT_FIREBASE_TOKEN, this.token);
          })
          .catch((error:any) => {
            this.logger.error(this, "subscribeNotifications", "onTokenRefresh", "getToken", error);
          });
      },
      (error:any) => {
        this.logger.error(this, "subscribeNotifications", "onTokenRefresh", error);
      });
    }
    else {
      this.logger.info(this, "subscribeNotifications", "Browser does not support notifications");
    }
  }

  public publishEvent(notification:any) {
    if (notification && notification['type'] == EVENT_CHECKIN_CREATED) {
      this.logger.info(this, "publishEvent", EVENT_CHECKIN_CREATED, notification);
      this.events.publish(EVENT_CHECKIN_CREATED, notification['checkin_id']);
    }
    else if (notification && notification['type'] == EVENT_CHECKIN_UPDATED) {
      this.logger.info(this, "publishEvent", EVENT_CHECKIN_UPDATED, notification);
      this.events.publish(EVENT_CHECKIN_UPDATED, notification['checkin_id']);
    }
    else if (notification && notification['type'] == EVENT_CHECKIN_DETAILS) {
      this.logger.info(this, "publishEvent", EVENT_CHECKIN_DETAILS, notification);
      this.events.publish(EVENT_CHECKIN_DETAILS, notification['checkin_id']);
    }
    else {
      this.logger.warn(this, "publishEvent", "Notification", notification);
    }
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
        this.logger.warn(this, "logUser", userId, "Skipped");
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
        this.logger.warn(this, "logPage", page, "Skipped");
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
        this.logger.warn(this, "logEvent", event, "Skipped");
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
        this.logger.warn(this, "logError", message, "Skipped");
        resolve(false);
      }
    });
  }

  private promiseTimeout(promise:Promise<any>, milliseconds:number=1000) {
    return new Promise((resolve, reject) => {
      let timer = setTimeout(() => {
        reject("Promise Timeout");
      }, milliseconds);
      promise.then((result:any) => {
        clearTimeout(timer);
        resolve(result);
      },
      (error:any) => {
        clearTimeout(timer);
        reject(error);
      })
      .catch((error:any) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  }

}
