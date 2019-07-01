import { Component, NgZone, Input } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';
import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';
import { AlertAutomaticSetupPage } from '../../pages/alert-automatic-setup/alert-automatic-setup';
import { Checkin } from '../../models/checkin';
import { AlertFeed } from '../../models/alertFeed';
import { AlertFeedPage } from '../../pages/alert-feed/alert-feed';

@IonicPage({
  name: 'AlertFeedAutomaticPage',
  segment: 'alert-feed-automatic'
})
@Component({
  selector: 'page-alert-feed-automatic',
  templateUrl: 'alert-feed-automatic.html',
  providers: [ ApiProvider, StorageProvider ]   
})
export class AlertFeedAutomaticPage extends BasePrivatePage {

  logo:string = "assets/images/logo-dots.png";
  checkin:Checkin = null;
  alertFeed:AlertFeed = null;
  automatic:boolean = false;

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

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    return new Promise((resolve, reject) => {
      return this.loadOrganization(cache)
      .then(() => { return this.loadUser(cache); })
      .then(() => { return this.loadAlertFeed(cache); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Loaded");
        // this.countRecipients();
        if (event) {
          event.complete();
        }
        resolve(true);
      })
      .catch((error) => {
        this.logger.error(this, "loadUpdates", "Failed", error);
        if (event) {
          event.complete();
        }
        this.showToast(error);
        resolve(false);
      });
    });
  }

  protected loadAlertFeed(cache:boolean=true):Promise<AlertFeed> {
    return new Promise((resolve, reject) => {
      if (cache && this.alertFeed) {
        resolve(this.alertFeed);
      }
      else if (cache && this.hasParameter("alertFeed")){
        this.alertFeed = this.getParameter<AlertFeed>("alertFeed");
        resolve(this.alertFeed);
      }
      else {
        reject("Alert Feed Not Provided");
      }
    });
  }

  private next(event:any) {
    if (!this.automatic) {
      this.showRootPage(AlertFeedPage);
    } else {
      let modal = this.showModal(AlertAutomaticSetupPage, {
        organization: this.organization,
        user: this.user,
        alertFeed: this.alertFeed
      });
      modal.onDidDismiss(data => {
        this.logger.info(this, "createCheckin", "Modal", data);
      });
    }
  }
}
