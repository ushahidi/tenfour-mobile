import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';

import { Subscription } from '../../models/subscription';
import { Organization } from '../../models/organization';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

import { EVENT_CREDITS_CHANGED } from '../../constants/events';

@IonicPage()
@Component({
  selector: 'page-settings-credits',
  templateUrl: 'settings-credits.html',
})
export class SettingsCreditsPage  extends BasePrivatePage {

  credits:number = 0;
  creditsEstimate:number = 0;
  billingEstimate:number = 0;
  subscription:Subscription = null;
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
    this.credits = this.getParameter<number>("credits");
    this.creditsEstimate = this.getParameter<number>("creditsEstimate");
    this.billingEstimate = this.getParameter<number>("billingEstimate");
    this.organization = this.getParameter<Organization>("organization");
    this.addCreditsImmediately = this.getParameter<boolean>("addCreditsImmediately");
    this.addCreditsRecurring = this.getParameter<boolean>("addCreditsRecurring");
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    if (this.organization) {
      this.analytics.trackPage(this, {
        organization: this.organization.name
      });
    }
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
          this.subscription = subscriptions[0];
          resolve(this.subscription);
        });
      }
    });
  }

  private closeModal(event:any) {
    this.hideModal();
  }

  private doneAdd(event:any) {
    let loading = this.showLoading("Adding credits...", true);

    Promise.resolve()
    .then(() => {
      if (this.addCreditsImmediately) {
        return this.api.addCredits(this.organization, this.subscription, this.credits);
      } else {
        return Promise.resolve(true);
      }
    })
    .then(() => {
      if (this.addCreditsRecurring) {
        this.organization.credits_extra = this.credits;

        return this.api.updateOrganization(this.organization).then((organization:Organization) => {
          this.organization = organization;
          return this.storage.saveOrganization(organization);
        });
      } else {
        return Promise.resolve(true);
      }
    })
    .then(() => {
      if (this.addCreditsImmediately) {
        return new Promise((resolve, reject) => {
          // HACK HACK HACK server polling - this can be replaced when push notifications land
          setTimeout(() => {
            this.api.getOrganization(this.organization)
            .then((organization:Organization) => { this.organization = organization; return this.storage.setOrganization(organization); })
            .then(() => {
              this.events.publish(EVENT_CREDITS_CHANGED, this.organization.credits, Date.now());
              resolve();
            },
            (error:any) => {
              reject(error);
            });
          }, 10000);
        });
      } else {
        return Promise.resolve(true);
      }
    })
    .then(() => {
      let alert = this.credits + ' extra credits have been added to your account';

      if (this.addCreditsRecurring) {
        alert += ' (recurring)';
      }

      loading.dismiss();
      this.showToast(alert);
      this.hideModal({
        organization: this.organization
      });
    })
    .catch((error:any) => {
      loading.dismiss();
      this.showAlert("Problem adding credits", error);
    });

  }

}
