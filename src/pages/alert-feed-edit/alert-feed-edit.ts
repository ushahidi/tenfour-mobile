import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';
import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';
import { AlertFeed } from '../../models/alertFeed';
import { AlertSource } from '../../models/alertSource';
import { AlertFeedAutomaticPage } from '../../pages/alert-feed-automatic/alert-feed-automatic';

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
  objectKeys = Object.keys;
  logo:string = "assets/images/logo-dots.png";
  alert:AlertFeed; 
  sources:AlertSource[];
  locations:{};
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
  openSourceUrl(url) {
    window.open(url, '_blank');
  }
  protected save() {
    this.api.createFeedForSource(this.organization, this.alert).then((saved:AlertFeed) => {
      this.hideModal({
        organization: this.organization,
        user: this.user
      }).then((loaded:any) => {
        this.showModal(AlertFeedAutomaticPage, {
          alertFeed: saved
        })
        this.logger.info(this, "showAlertFeed", "Loaded");
      },
      (error:any) => {
        this.logger.error(this, "showAlertFeed", error);
      });
    }).catch(
      error => { this.showToast("There was an error saving your request", 3000)}
    );
    
    this.logger.info(this, "showAlertFeed");
    
    // let modal = this.showModal(AlertFeedSourceEditPage, {
    //   alert: this.alert,
    // });
    // this.alert.organization_id = this.organization.id;
    // this.alert.owner_id = this.user.id;
    
  }
  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    return Promise.resolve()
      .then(() => { return this.loadOrganization(cache); })
      .then(() => { return this.loadUser(cache); })
      .then(() => { return this.loadAlertSources(); })
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

  protected loadAlertSources():Promise<AlertSource[]> {
    return new Promise((resolve, reject) => {
      this.api.getAlertSources(this.organization).then((sources:AlertSource[]) => {
        this.logger.info(this, "loadAlertSource", alert);
        this.zone.run(() => {
          this.sources = sources;
          this.locations = {};
          sources.forEach(source => {
            if (!this.locations[source.country]) {
              this.locations[source.country] = [];
            }
            if (source.state) {
              this.locations[source.country].push(source.state);
            }
          });
        });
        resolve(sources);
      },
      (error:any) => {
        this.logger.error(this, "loadAlertSource", error);
        resolve([]);
      });
    });
  }
  protected loadAlertFeed():Promise<AlertFeed> {
    return new Promise((resolve, reject) => {
      if (!this.alert) {
        this.alert = new AlertFeed({organization: this.organization, user: this.user});
        resolve(this.alert);
        return;
      }
      this.api.getAlertFeed(this.alert.id, this.organization).then((alert:AlertFeed) => {
        this.logger.info(this, "loadAlertFeed", alert);
        this.zone.run(() => {
          this.alert = alert;
        });
        resolve(alert);
      },
      (error:any) => {
        this.logger.error(this, "loadAlertFeed", error);
        this.alert = new AlertFeed({organization: this.organization, user: this.user});
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
