import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';
import { Notification } from '../../models/notification';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'NotificationListPage',
  segment: 'notifications'
})
@Component({
  selector: 'page-notification-list',
  templateUrl: 'notification-list.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ ]
})
export class NotificationListPage extends BasePage {

  organization:Organization = null;
  user:User = null;
  notifications:Notification[] = [];
  loading:boolean = false;
  limit:number = 20;
  offset:number = 0;
  modal:boolean = true;

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
      protected storage:StorageProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.modal = this.getParameter<boolean>("modal");
    this.loading = true;
    let loading = this.showLoading("Loading...");
    this.loadUpdates(true).then(updated => {
      loading.dismiss();
      this.loading = false;
    },
    (error:any) => {
      loading.dismiss();
      this.loading = false;
    });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    if (this.organization) {
      this.trackPage({
        organization: this.organization.name
      });
    }
  }

  ionViewWillLeave() {
    super.ionViewWillLeave();
    this.viewNotifications();
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    return Promise.resolve()
      .then(() => { return this.loadOrganization(cache); })
      .then(() => { return this.loadUser(cache); })
      .then(() => { return this.loadNotifications(cache); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Loaded");
        if (event) {
          event.complete();
        }
      })
      .catch((error) => {
        this.logger.error(this, "loadUpdates", "Failed", error);
        if (event) {
          event.complete();
        }
        this.showToast(error);
      });
  }

  private loadOrganization(cache:boolean=true):Promise<Organization> {
    return new Promise((resolve, reject) => {
      if (cache && this.organization) {
        resolve(this.organization);
      }
      else if (this.hasParameter("organization")){
        this.organization = this.getParameter<Organization>("organization");
        resolve(this.organization);
      }
      else {
        this.storage.getOrganization().then((organization:Organization) => {
          this.organization = organization;
          resolve(this.organization);
        });
      }
    });
  }

  private loadUser(cache:boolean=true):Promise<User> {
    return new Promise((resolve, reject) => {
      if (cache && this.user) {
        resolve(this.user);
      }
      else if (this.hasParameter("user")){
        this.user = this.getParameter<User>("user");
        resolve(this.user);
      }
      else {
        this.storage.getUser().then((user:User) => {
          this.user = user;
          resolve(this.user);
        });
      }
    });
  }
  private loadNotifications(cache:boolean=true):Promise<any> {
    return new Promise((resolve, reject) => {
      this.offset = 0;
      if (cache && this.mobile) {
        this.storage.getNotifications(this.organization, this.limit, this.offset).then((notifications:Notification[]) => {
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
          this.storage.saveNotifications(this.organization, notifications).then((saved:boolean) => {
            this.storage.getNotifications(this.organization, this.limit, this.offset).then((_notifications:Notification[]) => {
              if (_notifications && _notifications.length > 0) {
                this.notifications = _notifications;
                resolve(_notifications);
              }
              else {
                this.notifications = notifications;
                resolve(this.notifications);
              }
            },
            (error:any) => {
              resolve(notifications);
            });
          });
        },
        (error:any) => {
          this.notifications = [];
          reject(error);
        });
      }
    });
  }

  private loadMore(event:any) {
    this.logger.info(this, "loadMore");
    return new Promise((resolve, reject) => {
      if (this.mobile) {
        this.offset = this.offset + this.limit;
        this.logger.info(this, "loadMore", this.offset);
        this.storage.getNotifications(this.organization, this.limit, this.offset).then((notifications:Notification[]) => {
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
      }
      else if (event) {
        event.complete();
      }
    });
  }

  private viewNotifications() {
    this.logger.info(this, "viewNotifications");
    if (this.mobile) {
      for (let notification of this.notifications) {
        notification.viewed_at = new Date();
      }
      this.storage.saveNotifications(this.organization, this.notifications).then((saved:boolean) => {
        this.logger.info(this, "viewNotifications", "Saved", saved);
      });
    }
    else {

    }
  }

  private close(event:any) {
    this.hideModal();
  }

}
