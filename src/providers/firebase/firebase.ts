import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { Observable } from "rxjs/Observable"
import 'rxjs/add/observable/of';

import { Firebase } from '@ionic-native/firebase';

import { LoggerProvider } from '../../providers/logger/logger';
import { StorageProvider } from '../../providers/storage/storage';

@Injectable()
export class FirebaseProvider {

  constructor(
    private platform:Platform,
    private firebase:Firebase,
    private logger:LoggerProvider,
    private storage:StorageProvider) {
  }

  public initialize():Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.firebase.getToken().then((token:string) => {
          this.logger.info(this, "initialize", "getToken", token);
          this.storage.setFirebase(token).then((stored:boolean) => {
            this.logger.info(this, "initialize", "setFirebase", token, "Stored");
          },
          (error:any) => {
            this.logger.error(this, "initialize", "setFirebase", token, "Failed", error);
          });
          resolve(true);
        })
        .catch((error:any) => {
          this.logger.error(this, "initialize", "getToken", error);
          this.storage.removeFirebase().then((removed:boolean) => {
            this.logger.info(this, "initialize", "removeFirebase", "Removed");
          },
          (error:any) => {
            this.logger.error(this, "initialize", "removeFirebase", "Failed", error);
          });
          resolve(false);
        });
      }
      else {
        resolve(false);
      }
    });
  }

  public onNotificationOpen():Observable<any> {
    return this.firebase.onNotificationOpen();
  }

}
