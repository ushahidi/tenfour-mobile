import { Component, NgZone, Input } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';
import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';
import { AlertFeedEditPage } from '../../pages/alert-feed-edit/alert-feed-edit';
import { AlertFeed } from '../../models/alertFeed';
import { AlertCheckinEditPage } from '../../pages/alert-checkin-edit/alert-checkin-edit';
import { AlertFeedEntry } from '../../models/alertFeedEntry';

@IonicPage({
  name: 'AlertFeedEntriesPage',
  segment: 'alert-feed-entries'
})
@Component({
  selector: 'page-alert-feed-entries',
  templateUrl: 'alert-feed-entries.html',
  providers: [ ApiProvider, StorageProvider ]   
})
export class AlertFeedEntriesPage extends BasePrivatePage {

  logo:string = "assets/images/logo-dots.png";
  feed:AlertFeed = null;
  
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
      .then(() => { return this.loadFeed(true); })
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

  private addAlertFeed(event:any = null) {
    this.logger.info(this, "addAlertFeed");
    this.showModal(AlertFeedEditPage, {
      organization: this.organization,
      user: this.user
    });
  }

  protected loadFeed(cache:boolean=true):Promise<AlertFeed> {
    return new Promise((resolve, reject) => {
      if (cache && this.feed) {
        resolve(this.feed);
      }
      else if (cache && this.hasParameter("feed")){
        this.feed = this.getParameter<AlertFeed>("feed");
        resolve(this.feed);
      }
      else {
        reject("Feed Not Provided");
      }
    });
  }

  private next(feedEntry:AlertFeedEntry) {
    const _feedEntry = new AlertFeedEntry().copyInto(feedEntry);
    let modal = this.showModal(AlertCheckinEditPage, {
      organization: this.organization,
      user: this.user,
      feedEntry: _feedEntry
    });
    
    modal.onDidDismiss(data => {
      this.logger.info(this, "createCheckin", "Modal", data);
    });
  }

  private createCheckin(feedEntry:AlertFeedEntry) {
    const _feedEntry = new AlertFeedEntry().copyInto(feedEntry);
    let modal = this.showModal(AlertCheckinEditPage, {
      organization: this.organization,
      user: this.user,
      feedEntry: _feedEntry
    });
    
    modal.onDidDismiss(data => {
      this.logger.info(this, "createCheckin", "Modal", data);
    });
  }
}
