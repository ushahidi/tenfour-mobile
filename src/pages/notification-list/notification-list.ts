import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';
import { Notification } from '../../models/notification';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

import { EVENT_NOTIFICATIONS_CHANGED } from '../../constants/events';

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
export class NotificationListPage extends BasePrivatePage {

  notifications:Notification[] = [];
  loading:boolean = false;
  limit:number = 20;
  offset:number = 0;
  defaultLogo:string = "assets/images/logo-dots.png";

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
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
    this.limit = this.website ? 20 : 10;
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    let loading = this.showLoading("Loading...");
    this.loadUpdates(true)
      // .then(this.markAllNotificationsAsRead)
      .then((loaded:any) => {
      loading.dismiss();
    });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    if (this.organization) {
      this.analytics.trackPage(this, {
        organization: this.organization.name
      });
    }
  }

  ionViewWillLeave() {
    super.ionViewWillLeave();
    this.viewNotifications();
    this.markAllNotificationsAsRead();
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    this.loading = true;
    return Promise.resolve()
      .then(() => { return this.loadOrganization(cache); })
      .then(() => { return this.loadUser(cache); })
      .then(() => { return this.loadNotifications(cache); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Loaded");
        if (event) {
          event.complete();
        }
        this.loading = false;
      })
      .catch((error) => {
        this.logger.error(this, "loadUpdates", "Failed", error);
        if (event) {
          event.complete();
        }
        this.loading = false;
        this.showToast(error);
      });
  }

  private loadNotifications(cache:boolean=true):Promise<any> {
    return new Promise((resolve, reject) => {
      this.offset = 0;
      this.promiseFallback(cache,
        this.storage.getNotifications(this.organization, this.limit, this.offset),
        this.api.getNotifications(this.organization, this.limit, this.offset), 1).then((notifications:Notification[]) => {
          this.storage.saveNotifications(this.organization, notifications).then((saved:boolean) => {
            this.notifications = notifications;
            resolve(notifications);
          },
          (error:any) => {
            this.notifications = notifications;
            reject(error);
          });
        },
        (error:any) => {
          this.notifications = [];
          reject(error);
        });
    });
  }

  private loadMore(event:any):Promise<Notification[]> {
    this.logger.info(this, "loadMore");
    return new Promise((resolve, reject) => {
      this.offset = this.offset + this.limit;
      this.promiseFallback(true,
        this.storage.getNotifications(this.organization, this.limit, this.offset),
        this.api.getNotifications(this.organization, this.limit, this.offset), 1).then((notifications:Notification[]) => {
          this.storage.saveNotifications(this.organization, notifications).then((saved:boolean) => {
            this.notifications = notifications;
            if (event) {
              event.complete();
            }
            resolve(notifications);
          },
          (error:any) => {
            this.notifications = notifications;
            if (event) {
              event.complete();
            }
            reject(error);
          });
        },
        (error:any) => {
          if (event) {
            event.complete();
          }
          this.showToast(error);
          reject(error);
        });
    });
  }

  private viewNotifications() {
    this.logger.info(this, "viewNotifications");
    for (let notification of this.notifications) {
      notification.viewed_at = new Date();
    }
    this.storage.saveNotifications(this.organization, this.notifications).then((saved:boolean) => {
      this.logger.info(this, "viewNotifications", "Saved", saved);
    });
  }

  private markAllNotificationsAsRead() {
    this.logger.info(this, "markAllNotificationsAsRead");
    this.api.markAllNotificationsAsRead(this.organization, this.user).then(() => {
      this.logger.info(this, "markAllNotificationsAsRead", "done");
      this.events.publish(EVENT_NOTIFICATIONS_CHANGED);
    });
  }

  private close(event:any) {
    this.hideModal();
  }

}
