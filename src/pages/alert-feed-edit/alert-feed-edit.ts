import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';
import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';
import { AlertFeed } from '../../models/alertFeed';
import { AlertFeedSourceEditPage } from '../../pages/alert-feed-source-edit/alert-feed-source-edit';

@IonicPage({
  name: 'AlertFeedEditPage',
  segment: 'alert-feed-edit'
})
@Component({
  selector: 'page-alert-feed-edit',
  templateUrl: 'alert-feed-edit.html',
  providers: [ ApiProvider, StorageProvider ],
})
export class AlertFeedEditPage extends BasePrivatePage {

  logo:string = "assets/images/logo-dots.png";
  alert:AlertFeed; 
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

  ionViewWillEnter() {
    super.ionViewWillEnter();
    let loading = this.showLoading("Loading...");
    this.loadUpdates(true).then((loaded:any) => {
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
  protected showNext() {
    let modal = this.showModal(AlertFeedSourceEditPage, {
      alert: this.alert,
    });
  }
  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    return Promise.resolve()
      .then(() => { return this.loadOrganization(cache); })
      .then(() => { return this.loadUser(cache); })
      .then(() => { return this.loadAlertFeed(); })
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

  protected loadAlertFeed():Promise<AlertFeed> {
    return new Promise((resolve, reject) => {
      if (!this.alert) {
        this.alert = new AlertFeed();
        resolve(this.alert);
      }
      this.api.getAlertFeed(this.alert.id).then((alert:AlertFeed) => {
        this.logger.info(this, "loadAlertFeed", alert);
        this.zone.run(() => {
          this.alert = alert;
        });
        resolve(alert);
      },
      (error:any) => {
        this.logger.error(this, "loadAlertFeed", error);
        this.alert = new AlertFeed();
        resolve(this.alert);
      });
    });
  }

  private cancelEdit(event:any) {
    this.logger.info(this, "cancelEdit");
    this.hideModal({
      canceled: true
    });
  }
}
