import { Component, NgZone } from '@angular/core';
import { IonicPage, Events, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';

import { Subscription } from '../../models/subscription';
import { Organization } from '../../models/organization';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage()
@Component({
  selector: 'page-settings-plan-free',
  templateUrl: 'settings-plan-free.html',
})
export class SettingsPlanFreePage extends BasePrivatePage {

  subscription:Subscription = null;

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
      protected storage:StorageProvider,
      protected events:Events) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewWillLoad() {
    super.ionViewDidEnter();
    let loading = this.showLoading("Checking your plan...", true);
    this.loadUpdates(false).then((loaded:any) => {
      loading.dismiss();
    });
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    return Promise.resolve()
      .then(() => { return this.loadOrganization(cache); })
      .then(() => { return this.loadUser(cache); })
      .then(() => { return this.loadSubscription(cache); })
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
        let alert = this.showAlert("Problem Switching to Free Plan", error);
        alert.onDidDismiss((dismiss:any) => {
          this.hideModal();
        });
      });
  }

  private loadSubscription(cache:boolean=true):Promise<Subscription> {
    return new Promise((resolve, reject) => {
      if (cache && this.subscription) {
        resolve(this.subscription);
      }
      else {
        this.api.getSubscriptions(this.organization).then((subscriptions:Subscription[]) => {
          if (subscriptions.length !== 1) {
            reject("Current plan was not found");
          }
          else if (subscriptions[0].plan_id === 'free-plan') {
            reject("You are already on the free plan");
          }
          else {
            this.subscription = subscriptions[0];
            resolve(this.subscription);
          }
        });
      }
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

  private closeModal(event:any) {
    this.hideModal();
  }

  private switchToFree(event:any) {
    this.logger.info(this, "switchToFree");
    let loading = this.showLoading("Switching to Free Plan...", true);
    this.api.deleteSubscription(this.organization, this.subscription)
      .then((subscription:Subscription) => { this.subscription = subscription; return this.api.getOrganization(this.organization); })
      .then((organization:Organization) => { return this.storage.setOrganization(organization); })
      .then(() => { return this.storage.saveSubscription(this.organization, this.subscription); })
      .then(() => {
        this.events.publish('subscription:changed', this.subscription, Date.now());
        loading.dismiss();
        this.hideModal();
      })
      .catch((error:any) => {
        loading.dismiss();
        this.showAlert("Problem Switching to Free Plan", error);
      });
  }

}
