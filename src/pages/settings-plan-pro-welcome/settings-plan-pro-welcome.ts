import { Component, NgZone } from '@angular/core';
import { IonicPage, Events, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';

import { Subscription } from '../../models/subscription';
import { Organization } from '../../models/organization';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage()
@Component({
  selector: 'page-settings-plan-pro-welcome',
  templateUrl: 'settings-plan-pro-welcome.html',
})
export class SettingsPlanProWelcomePage extends BasePrivatePage {

  subscription:Subscription = null;
  retryCount:number = 0;

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
    this.loadUpdates(true).then((loaded:any) => {
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
        this.showAlert("Problem Switching to Pro Plan", error);
        this.hideModal();
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
            return reject("Current plan was not found");
          }
          if (subscriptions[0].plan_id !== 'pro-plan') {
            return reject("There was a problem changing to Pro plan");
          }

          this.subscription = subscriptions[0];
          this.events.publish('subscription:changed', this.subscription, Date.now());

          resolve(this.subscription);
        });
      }
    });
  }

  private closeModal(event:any) {
    this.hideModal();
  }
}
