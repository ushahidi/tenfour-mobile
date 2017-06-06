import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Token } from '../../models/token';
import { Organization } from '../../models/organization';
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
  notifications:Notification[] = null;
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
    this.loadNotifications(null, true);
  }

  loadNotifications(event:any, cache:boolean=true) {
    this.loading = true;
    if (cache) {
      this.database.getNotifications(this.organization).then((notifications:Notification[]) => {
        if (notifications && notifications.length > 0) {
          this.notifications = notifications;
          if (event) {
            event.complete();
          }
          this.loading = false;
        }
        else {
          this.loadNotifications(event, false);
        }
      });
    }
    else {
      this.api.getToken().then(
        (token:Token) => {
          this.api.getNotifications(token, this.organization).then(
            (notifications:Notification[]) => {
              let saves = [];
              for (let notification of notifications) {
                saves.push(this.database.saveNotification(this.organization, notification));
              }
              Promise.all(saves).then(saved => {
                this.notifications = notifications;
                if (event) {
                  event.complete();
                }
                this.loading = false;
              });
            },
            (error:any) => {
              this.loading = false;
              if (event) {
                event.complete();
              }
              this.showToast(error);
            });
        },
        (error:any) => {
          this.loading = false;
          if (event) {
            event.complete();
          }
          this.showToast(error);
        });
    }
  }

}
