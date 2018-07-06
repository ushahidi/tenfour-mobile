import { Component, NgZone } from '@angular/core';
import { Platform, NavParams, AlertController, ToastController, ModalController, LoadingController, ActionSheetController, NavController, ViewController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';

import { StorageProvider } from '../../providers/storage/storage';

import { EVENT_USER_UNAUTHORIZED } from '../../constants/events';

@Component({
  selector: 'base-private-page',
  template: "<ion-header></ion-header><ion-content></ion-content>",
  providers: [ StorageProvider ]
})
export class BasePrivatePage extends BasePage {

  protected organization:Organization = null;
  protected user:User = null;

  constructor(
      protected zone:NgZone,
      protected platform:Platform,
      protected navParams:NavParams,
      protected navController:NavController,
      protected viewController:ViewController,
      protected modalController:ModalController,
      protected toastController:ToastController,
      protected alertController:AlertController,
      protected loadingController:LoadingController,
      protected actionController:ActionSheetController,
      protected storage:StorageProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewCanEnter():Promise<boolean> {
    return new Promise((resolve, reject) => {
      Promise.resolve()
        .then(() => this.loadOrganization(true))
        .then(() => this.loadUser(true))
        .then(() => {
          if (this.organization && this.user) {
            this.logger.info(this, "ionViewCanEnter", "YES");
            resolve(true);
          }
          else {
            this.logger.error(this, "ionViewCanEnter", "NO");
            this.events.publish(EVENT_USER_UNAUTHORIZED);
            resolve(false);
          }
        })
        .catch((error:any) => {
          this.logger.error(this, "ionViewCanEnter", "NO");
          this.events.publish(EVENT_USER_UNAUTHORIZED);
          resolve(false);
        });
    });
  }

  protected loadOrganization(cache:boolean=true):Promise<Organization> {
    return new Promise((resolve, reject) => {
      if (cache && this.organization) {
        resolve(this.organization);
      }
      else if (cache && this.hasParameter("organization")) {
        this.organization = this.getParameter<Organization>("organization");
        resolve(this.organization);
      }
      else {
        this.storage.getOrganization().then((organization:Organization) => {
          if (organization) {
            this.organization = organization;
            resolve(this.organization);
          }
          else {
            reject("Organization is not loaded");
          }
        },
        (error:any) => {
          this.logger.error(this, "loadOrganization", error);
          reject("Organization is not loaded");
        });
      }
    });
  }

  protected loadUser(cache:boolean=true):Promise<User> {
    return new Promise((resolve, reject) => {
      if (cache && this.user) {
        resolve(this.user);
      }
      else if (cache && this.hasParameter("user")) {
        this.user = this.getParameter<User>("user");
        resolve(this.user);
      }
      else {
        this.storage.getUser().then((user:User) => {
          if (user) {
            this.user = user;
            resolve(this.user);
          }
          else {
            reject("You are not logged in");
          }
        },
        (error:any) => {
          this.logger.error(this, "loadUser", error);
          reject("You are not logged in");
        });
      }
    });
  }

}
