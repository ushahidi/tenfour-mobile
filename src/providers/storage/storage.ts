import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { LocalStorageService } from 'ngx-localstorage';

import { NativeStorage } from '@ionic-native/native-storage';

@Injectable()
export class StorageProvider {

  constructor(
    private platform:Platform,
    private webStorage:LocalStorageService,
    private nativeStorage:NativeStorage) {
  }

  public set(key:string, value:any):Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.nativeStorage.setItem(key, value).then(
          (data:any) => {
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
        this.nativeStorage.getItem(key).then(
          (data:any) => {
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
        this.nativeStorage.remove(key).then(
          (removed:any) => {
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
