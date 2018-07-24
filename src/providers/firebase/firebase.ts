import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { Observable } from "rxjs/Observable"
import 'rxjs/add/observable/of';

import { Firebase } from '@ionic-native/firebase';
import { FirebaseApp } from 'angularfire2';

import { LoggerProvider } from '../../providers/logger/logger';
import { StorageProvider } from '../../providers/storage/storage';

@Injectable()
export class FirebaseProvider {

  private firebaseWeb;

  constructor(
    private platform:Platform,
    private firebaseNative:Firebase,
    private firebaseApp:FirebaseApp,
    private logger:LoggerProvider,
    private storage:StorageProvider) {
    this.firebaseWeb = firebaseApp.messaging();
  }

  public initialize():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "initialize");
      if (this.platform.is("cordova")) {
        this.getToken().then((token:string) => {
          this.logger.info(this, "initialize", token);
          resolve(token != null);
        },
        (error:any) => {
          this.logger.error(this, "initialize", error);
          resolve(false);
        });
      }
      else {
        navigator.serviceWorker.register('service-worker.js').then((registration) => {
          this.logger.info(this, "initialize", "registration", registration);
          this.firebaseWeb.useServiceWorker(registration);
          this.getToken().then((token:string) => {
            this.logger.info(this, "initialize", token);
            resolve(token != null);
          },
          (error:any) => {
            this.logger.error(this, "initialize", error);
            resolve(false);
          });
        });
      }
    });
  }

  public hasPermission():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "hasPermission");
      if (this.platform.is("cordova")) {
        this.firebaseNative.hasPermission().then((data:any) => {
          this.logger.info(this, "hasPermission", data);
          resolve(data && data.isEnabled);
        },
        (error:any) => {
          this.logger.error(this, "hasPermission", error);
          resolve(false);
        });
      }
      else {
        this.firebaseWeb.getToken().then((token:any) => {
          this.logger.info(this, "hasPermission", token != null);
          resolve(token != null);
        },
        (error:any) => {
          this.logger.error(this, "hasPermission", error);
          resolve(false);
        });
      }
    });
  }

  public requestPermission():Promise<any> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "requestPermission");
      if (this.platform.is("cordova")) {
        this.firebaseNative.grantPermission().then((permission:any) => {
          this.logger.info(this, "requestPermission", permission);
          resolve(permission);
        },
        (error:any) => {
          this.logger.error(this, "requestPermission", error);
          resolve(null);
        });
      }
      else {
        this.firebaseWeb.requestPermission().then((permission:any) => {
          this.logger.info(this, "requestPermission", permission);
          resolve(permission);
        },
        (error:any) => {
          this.logger.error(this, "requestPermission", error);
          resolve(null);
        });
      }
    });
  }

  public getToken():Promise<string> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "getToken");
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
          this.logger.error(this, "getToken", error);
          this.storage.removeFirebase().then((removed:boolean) => {
            resolve(null);
          },
          (error:any) => {
            resolve(null);
          });
        });
      }
      else {
        this.firebaseWeb.getToken().then((token:string) => {
          this.logger.info(this, "getToken", token);
          this.storage.setFirebase(token).then((stored:boolean) => {
            resolve(token);
          },
          (error:any) => {
            resolve(token);
          });
        },
        (error:any) => {
          this.logger.error(this, "getToken", error);
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
      this.logger.info(this, "freshToken");
      if (this.platform.is("cordova")) {
        this.firebaseNative.onTokenRefresh().subscribe((token:string) => {
          this.logger.info(this, "freshToken", token);
          this.storage.setFirebase(token).then((stored:boolean) => {
            resolve(token);
          },
          (error:any) => {
            resolve(null);
          });
        });
      }
      else {
        this.firebaseWeb.onTokenRefresh().subscribe((token:string) => {
          this.logger.info(this, "freshToken", token);
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
      this.firebaseWeb.onMessage((data:any) => {
        this.logger.info(this, "onNotification", data);
        return Observable.of(data);
      });
    }
    return Observable.of(null);
  }

}
