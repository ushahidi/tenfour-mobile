import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Notification } from '../../models/notification';

@IonicPage()
@Component({
  selector: 'page-notification-list',
  templateUrl: 'notification-list.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[ ]
})
export class NotificationListPage extends BasePage {

  organization:Organization = null;
  person:Person = null;
  loading:boolean = false;

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
      protected api:ApiService,
      protected database:DatabaseService) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.person = this.getParameter<Person>("person");
    if (this.person.notifications == null || this.person.notifications.length == 0) {
      let loading = this.showLoading("Loading...");
      this.loadUpdates(null, true).then(updated => {
        loading.dismiss();
      },
      (error:any) => {
        loading.dismiss();
      });
    }
    else {
      this.loadUpdates(null, true);
    }
  }

  loadUpdates(event:any, cache:boolean=true) {
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

  loadNotifications(cache:boolean=true):Promise<any> {
    return new Promise((resolve, reject) => {
      if (cache) {
        return this.database.getNotifications(this.organization).then((notifications:Notification[]) => {
          if (notifications && notifications.length > 0) {
            this.person.notifications = notifications;
            resolve(notifications);
          }
          else {
            this.loadNotifications(false);
          }
        });
      }
      else {
        return this.api.getNotifications(this.organization).then(
          (notifications:Notification[]) => {
            let saves = [];
            for (let notification of notifications) {
              saves.push(this.database.saveNotification(this.organization, notification));
            }
            Promise.all(saves).then(saved => {
              this.person.notifications = notifications;
              resolve(notifications);
            });
          },
          (error:any) => {
            reject(error);
          });
      }
    });

  }

}
