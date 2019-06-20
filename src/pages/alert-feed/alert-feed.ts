import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';
import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';
import { AlertFeedEditPage } from '../../pages/alert-feed-edit/alert-feed-edit';
import { AlertFeed } from '../../models/alertFeed';

@IonicPage({
  name: 'AlertFeedPage',
  segment: 'alert-feed'
})
@Component({
  selector: 'page-alert-feed',
  templateUrl: 'alert-feed.html',
  providers: [ ApiProvider, StorageProvider ]   
})
export class AlertFeedPage extends BasePrivatePage {

  logo:string = "assets/images/logo-dots.png";
  feeds:AlertFeed[] = [];
  
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
    return Promise.resolve()
      .then(() => { return this.loadOrganization(cache); })
      .then(() => { return this.loadUser(cache); })
      .then(() => { return this.loadAlertFeeds(); })
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
  

  protected loadAlertFeeds():Promise<AlertFeed[]> {
    return new Promise((resolve, reject) => {
      this.api.getAlertFeeds(this.organization).then((feeds:AlertFeed[]) => {
        this.logger.info(this, "loadFeeds", feeds);
        // this.zone.run(() => {
        //   this.fe = organization;
        // });
        this.feeds = feeds;
        resolve(feeds);
      },
      (error:any) => {
        this.logger.error(this, "loadFeeds", error);
        this.feeds = [];
        resolve([]);
      });
    });
  }

  private addAlertFeed(event:any = null) {
    this.logger.info(this, "addAlertFeed");
    this.showModal(AlertFeedEditPage, {
      organization: this.organization,
      user: this.user
    });
    // modal.onDidDismiss(data => {
    //   this.logger.info(this, "addAlertFeed", "Modal", data);
    //   if (data) {
    //     let loading = this.showLoading("Loading...");
    //     this.loadAlertFeed(false).then((finished:any) => {
    //       loading.dismiss();
    //       if (data.alertFeed && data.alertFeed.id) {
    //         this.showToast(`Added ${data.person.name}`);
    //       }
    //     },
    //     (error:any) => {
    //       loading.dismiss();
    //     });
    //   }
    // });
  }

}
