import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';

import { Subscription } from '../../models/subscription';
import { Organization } from '../../models/organization';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage()
@Component({
  selector: 'page-settings-plan-pro',
  templateUrl: 'settings-plan-pro.html',
})
export class SettingsPlanProPage extends BasePrivatePage {

  subscription:Subscription = null;
  iframe:SafeResourceUrl = null;
  action:string = null;

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
      protected sanitizer:DomSanitizer) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewDidLoad() {
    super.ionViewWillEnter();
    let loading = this.showLoading("Checking your plan...", true);
    this.action = this.hasParameter("action") ? this.getParameter<string>("action") : 'switchtopro';
    this.loadUpdates(false).then((loaded:any) => {
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
      .then(() => { return this.loadSubscription(cache); })
      .then(() => { return this.loadPaymentForm(cache); })
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
        let alert = this.showAlert(this.action === 'switchtopro' ? "Problem Switching to Pro Plan" : "Problem updating your billing info", error);
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
          else if (this.action === 'switchtopro' && subscriptions[0].plan_id === 'pro-plan') {
            reject("You are already on the pro plan");
          }
          else if (this.action === 'update' && subscriptions[0].plan_id !== 'pro-plan' ) {
            reject("You cannot update your billing info on your current plan");
          }
          else {
            this.subscription = subscriptions[0];
            resolve(this.subscription);
          }
        });
      }
    });
  }

  private loadPaymentForm(cache:boolean=true):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.api.getPaymentUrl(this.organization, this.subscription, this.action).then((url:string) => {
        this.logger.info(this, "ChargeBee", url);
        this.iframe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        resolve(true);
      },
      (error:any) => {
        this.logger.error(this, "ChargeBee", error);
        reject(error);
      });
    });
  }

  private closeModal(event:any) {
    this.hideModal();
  }

}
