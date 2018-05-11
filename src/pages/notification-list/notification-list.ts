import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiProvider } from '../../providers/api/api';
import { DatabaseProvider } from '../../providers/database/database';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Notification } from '../../models/notification';

@IonicPage()
@Component({
  selector: 'page-notification-list',
  templateUrl: 'notification-list.html',
  providers: [ ApiProvider, DatabaseProvider ],
  entryComponents:[ ]
})
export class NotificationListPage extends BasePage {

  organization:Organization = null;
  person:Person = null;
  notifications:Notification[] = [];
  loading:boolean = false;
  limit:number = 20;
  offset:number = 0;

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
      protected api:ApiProvider,
      protected database:DatabaseProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.person = this.getParameter<Person>("person");
    this.notifications = this.getParameter<Notification[]>("notifications");
    let loading = this.showLoading("Loading...");
    this.loadUpdates(true).then(updated => {
      loading.dismiss();
    },
    (error:any) => {
      loading.dismiss();
    });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.trackPage({
      organization: this.organization.name
    });
  }

  ionViewWillLeave() {
    super.ionViewWillLeave();
    this.viewNotifications();
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.loading = true;
    return Promise.all([this.loadNotifications(cache)]).then(
      (loaded:any) =>{
        if (event) {
          event.complete();
        }
        this.loading = false;
      },
      (error:any) => {
        if (event) {
          event.complete();
        }
        this.loading = false;
        this.showToast(error);
      });
  }

  private loadMore(event:any) {
    this.logger.info(this, "loadMore");
    return new Promise((resolve, reject) => {
      this.offset = this.offset + this.limit;
      this.logger.info(this, "loadMore", this.offset);
      this.database.getNotifications(this.organization, this.limit, this.offset).then((notifications:Notification[]) => {
        this.notifications = [...this.notifications, ...notifications];
        if (event) {
          event.complete();
        }
        resolve(this.notifications);
      },
      (error:any) => {
        if (event) {
          event.complete();
        }
        reject(error);
        this.showToast(error);
      });
    });
  }

  private loadNotifications(cache:boolean=true):Promise<any> {
    return new Promise((resolve, reject) => {
      this.offset = 0;
      if (cache && this.mobile) {
        this.database.getNotifications(this.organization, this.limit, this.offset).then((notifications:Notification[]) => {
          if (notifications && notifications.length > 0) {
            this.notifications = notifications;
            resolve(notifications);
          }
          else {
            this.loadNotifications(false).then((_notifications:Notification[]) => {
              this.notifications = _notifications;
              resolve(_notifications);
            },
            (error:any) => {
              this.notifications = [];
              reject(error);
            });
          }
        });
      }
      else {
        this.api.getNotifications(this.organization).then((notifications:Notification[]) => {
          if (this.mobile) {
            let saves = [];
            for (let notification of notifications) {
              saves.push(this.database.saveNotification(this.organization, notification));
            }
            Promise.all(saves).then(saved => {
              this.database.getNotifications(this.organization, this.limit, this.offset).then((_notifications:Notification[]) => {
                this.notifications = _notifications;
                resolve(_notifications);
              },
              (error:any) => {
                resolve(notifications);
              });
            });
          }
          else {
            this.notifications = notifications;
            resolve(notifications);
          }
        },
        (error:any) => {
          this.notifications = [];
          reject(error);
        });
      }
    });
  }

  private viewNotifications() {
    this.logger.info(this, "viewNotifications");
    if (this.mobile) {
      let saves = [];
      for (let notification of this.notifications) {
        notification.viewed_at = new Date();
        saves.push(this.database.saveNotification(this.organization, notification));
      }
      Promise.all(saves).then(saved => {
        this.logger.info(this, "viewNotifications", "Saved", saved);
      },
      (error:any) => {
        this.logger.error(this, "viewNotifications", "Failed", error);
      });  
    }
    else {

    }
  }

}
