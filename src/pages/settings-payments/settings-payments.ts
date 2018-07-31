import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';
import { SettingsPlanFreePage } from '../settings-plan-free/settings-plan-free';
import { SettingsPlanProPage } from '../settings-plan-pro/settings-plan-pro';
import { SettingsPlanProWelcomePage } from '../settings-plan-pro-welcome/settings-plan-pro-welcome';
import { SettingsCreditsPage } from '../settings-credits/settings-credits';

import { Organization } from '../../models/organization';
import { Subscription } from '../../models/subscription';
import { User } from '../../models/user';
import { Person } from '../../models/person';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

import { EVENT_SUBSCRIPTION_CHANGED } from '../../constants/events';

@IonicPage({
  name: 'SettingsPaymentsPage',
  segment: 'settings/payments',
  defaultHistory: ['SettingsListPage']
})
@Component({
  selector: 'page-settings-payments',
  templateUrl: 'settings-payments.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ SettingsPlanFreePage, SettingsPlanProPage, SettingsPlanProWelcomePage, SettingsCreditsPage ]
})
export class SettingsPaymentsPage extends BasePrivatePage {

  PRO_FLAT_RATE:number = 39;
  FREE_USERS:number = 100;
  USER_BUNDLE_RATE:number = 5;
  USER_BUNDLE_UNIT:number = 25;
  CREDIT_BUNDLE_RATE:number = .1;

  subscription:Subscription = null;
  hashChangeFn = null;
  switchToProModal = null;
  billingEstimate:number = 0;
  updatedCredits:number = 0;
  updatedCreditsCost:number = 0;
  addCreditsImmediately:boolean = true;
  addCreditsRecurring:boolean = false;

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
    this.loadUpdates(false).then((loaded:any) => {
      loading.dismiss();
    });
    this.events.subscribe('subscription:changed', (subscription, time) => {
      this.loadUpdates(false);
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

  ionViewWillLeave() {
    super.ionViewWillLeave();

    if (this.hashChangeFn) {
      window.removeEventListener("hashchange", this.hashChangeFn, false);
    }
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    return Promise.resolve()
      .then(() => { return this.loadOrganization(cache); })
      .then(() => { return this.loadSubscription(cache); })
      .then(() => { return this.loadUser(cache); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Loaded");
        this.updatedCredits = this.organization.credits_extra;
        this.billingEstimate = this.calcBillingEstimate();
        this.onCreditsChange();
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

  private loadSubscription(cache:boolean=true):Promise<Subscription> {
    return new Promise((resolve, reject) => {
      if (cache && this.subscription) {
        resolve(this.subscription);
      }
      else {
        this.storage.getSubscription().then((subscription:Subscription) => {
          this.subscription = subscription;
          resolve(this.subscription);
        });
      }
    });
  }

  private closeModal(event:any) {
    this.hideModal();
  }

  private switchToFree(event:any) {
    this.logger.info(this, "switchToFree");
    let modal = this.showModal(SettingsPlanFreePage);
  }

  private hashChangeSwitchToPro() {
    this.logger.info(this, "hashChangeSwitchToPro");
    this.platform.setQueryParams(window.location.href);
    if (this.hasParameter('id') && this.hasParameter('state')) {
      if (this.getParameter('state') === 'succeeded') {
        this.completeSwitchToPro();
      }
    }
  }

  private completeSwitchToPro() {
    this.switchToProModal.dismiss();
    let loading = this.showLoading("Switching to TenFour Pro...", true);
    let retryCount = 0;
    let checkSubscription = () => {
      return new Promise((resolve, reject) => {
        this.api.getSubscriptions(this.organization).then((subscriptions:Subscription[]) => {
          if (subscriptions.length < 1) {
            return reject("Current plan was not found");
          }
          if (subscriptions[0].plan_id === 'pro-plan') {
            this.subscription = subscriptions[0];
            return this.api.getOrganization(this.organization).then((organization:Organization) => {
              this.storage.setOrganization(organization)
                .then(()=>{return this.storage.saveSubscription(organization, this.subscription)})
                .then(()=>{
                  this.events.publish(EVENT_SUBSCRIPTION_CHANGED, this.subscription, Date.now());
                  resolve(this.subscription);
                });
            });
          }
          if (retryCount++ > 5) {
            // HACK HACK HACK server polling - this can be replaced when push notifications land
            reject('Could not switch plans. Try logging out of your account.');
          }
          setTimeout(() => {
            checkSubscription().then((subscription:Subscription) => {
              resolve(subscription);
            },
            (error:any) => {
              reject(error);
            });
          }, 5000);
        });
      });
    };
    checkSubscription()
      .then(() => {
        this.showModal(SettingsPlanProWelcomePage);
        this.billingEstimate = this.calcBillingEstimate();
        loading.dismiss();
      })
      .catch((e) => {
        this.showAlert("Problem Switching to Pro Plan", e);
        loading.dismiss();
      });
  }

  private switchToPro(event:any) {
    this.logger.info(this, "switchToPro");
    if (!this.hashChangeFn) {
      this.hashChangeFn = this.hashChangeSwitchToPro.bind(this);
      window.addEventListener("hashchange", this.hashChangeFn, false);
    }
    this.switchToProModal = this.showModal(SettingsPlanProPage, {
      action: 'switchtopro'
    });
  }

  private hashChangeUpdateBillingInfo() {
    this.logger.info(this, "hashChangeUpdateBillingInfo");
    this.platform.setQueryParams(window.location.href);
    if (this.hasParameter('id') && this.hasParameter('state')) {
      if (this.getParameter('state') === 'succeeded') {
        this.switchToProModal.dismiss();
        this.showToast("Your billing info has been updated");
      }
    }
  }

  private updateBillingInfo(event:any) {
    this.logger.info(this, "updateBillingInfo");
    if (!this.hashChangeFn) {
      this.hashChangeFn = this.hashChangeUpdateBillingInfo.bind(this);
      window.addEventListener("hashchange", this.hashChangeFn, false);
    }
    this.switchToProModal = this.showModal(SettingsPlanProPage, {
      action: 'update'
    });
  }

  private calcBillingEstimate(extraCredits?:number):number {
    let estimate = this.PRO_FLAT_RATE;
    if (this.organization.user_count > this.FREE_USERS) {
      estimate += this.USER_BUNDLE_RATE * Math.ceil((this.organization.user_count - this.FREE_USERS)/this.USER_BUNDLE_UNIT);
    }
    if (extraCredits) {
      estimate += extraCredits * this.CREDIT_BUNDLE_RATE;
    } else if (this.updatedCredits) {
      estimate += this.updatedCredits * this.CREDIT_BUNDLE_RATE;
    }
    return estimate
  }

  private onCreditsChange() {
    this.logger.info(this, "onExtraCreditsChange");
    this.updatedCreditsCost = (this.updatedCredits * .1);
  }

  private addCredits(event:any) {
    this.logger.info(this, "addCredits");
    if (!this.addCreditsImmediately && !this.addCreditsRecurring) {
      return this.showAlert("Add credits", "Please select an option.");
    }
    if (!this.updatedCredits || this.updatedCredits <= 0) {
      return this.showAlert("Add credits", "Please specify how many credits to add.");
    }
    let modal = this.showModal(SettingsCreditsPage, {
      credits: this.updatedCredits,
      creditsEstimate: this.updatedCredits * this.CREDIT_BUNDLE_RATE,
      billingEstimate: this.calcBillingEstimate(this.updatedCredits),
      organization: this.organization,
      addCreditsImmediately: this.addCreditsImmediately,
      addCreditsRecurring: this.addCreditsRecurring
    });
    modal.onDidDismiss(data => {
      this.logger.info(this, "addCredits", "Modal", data);
      this.api.getOrganization(this.organization).then((organization:Organization) => {
        this.storage.setOrganization(organization).then(() => {
          this.loadUpdates();
        });
      });
      if (data) {
        if (data.organization) {
          this.logger.info(this, "addCredits", "Modal", data.organization);
          this.organization = data.organization;
          this.billingEstimate = this.calcBillingEstimate();
          this.loadUpdates();
        }
      }
   });
  }
}
