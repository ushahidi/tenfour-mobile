import { Component, NgZone } from '@angular/core';
import { IonicPage, Events, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { SettingsSwitchtofreePage } from '../settings-switchtofree/settings-switchtofree';
import { SettingsSwitchtoproPage } from '../settings-switchtopro/settings-switchtopro';
import { SettingsWelcometoproPage } from '../settings-welcometopro/settings-welcometopro';

import { Organization } from '../../models/organization';
import { Subscription } from '../../models/subscription';
import { User } from '../../models/user';
import { Person } from '../../models/person';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'SettingsPaymentsPage',
  segment: 'settings/payments',
  defaultHistory: ['SettingsListPage']
})
@Component({
  selector: 'page-settings-payments',
  templateUrl: 'settings-payments.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ SettingsSwitchtofreePage, SettingsSwitchtoproPage, SettingsWelcometoproPage ]
})
export class SettingsPaymentsPage extends BasePage {

  organization:Organization = null;
  user:User = null;
  hashChangeFn = null;
  switchToProModal = null;

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
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    let loading = this.showLoading("Loading...");
    this.loadUpdates(false).then((loaded:any) => {
      loading.dismiss();
    },
    (error:any) => {
      loading.dismiss();
      this.showToast(error);
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

    this.hashChangeFn = this.hashChange.bind(this);
    window.addEventListener("hashchange", this.hashChangeFn, false);
  }

  ionViewWillLeave() {
    super.ionViewWillLeave();
    window.removeEventListener("hashchange", this.hashChangeFn, false);
  }

  private hashChange() {
    this.logger.info(this, "hashChange");
    this.extractQueryParams();

    if (this.queryParams['id'] && this.queryParams['state']) {
      if (this.queryParams['state'] === 'succeeded') {
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
            let subscription = subscriptions[0];

            return this.api.getOrganization(this.organization).then((organization:Organization) => {
              this.storage.setOrganization(organization)
                .then(()=>{return this.storage.saveSubscription(organization, subscription)})
                .then(()=>{
                  this.events.publish('subscription:changed', subscription, Date.now());
                  resolve(subscription);
                });
            });
          }

          if (retryCount++ > 5) {
            reject('Could not switch to Pro plan');
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
        this.showModal(SettingsWelcometoproPage);
        loading.dismiss();
      })
      .catch((e) => {
        this.showAlert("Problem Switching to Pro Plan", e);
        loading.dismiss();
      });
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    return Promise.resolve()
      .then(() => { return this.loadOrganization(cache); })
      .then(() => { return this.loadUser(cache); })
      // .then(() => { return this.loadPaymentForm(cache); })
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

  private loadOrganization(cache:boolean=true):Promise<Organization> {
    return new Promise((resolve, reject) => {
      if (cache && this.organization) {
        resolve(this.organization);
      }
      else if (this.hasParameter("organization")){
        this.organization = this.getParameter<Organization>("organization");
        resolve(this.organization);
      }
      else {
        this.storage.getOrganization().then((organization:Organization) => {
          this.organization = organization;
          resolve(this.organization);
        });
      }
    });
  }

  private loadUser(cache:boolean=true):Promise<User> {
    return new Promise((resolve, reject) => {
      if (cache && this.user) {
        resolve(this.user);
      }
      else if (this.hasParameter("user")){
        this.user = this.getParameter<User>("user");
        resolve(this.user);
      }
      else {
        this.storage.getUser().then((user:User) => {
          this.user = user;
          resolve(this.user);
        });
      }
    });
  }

  private back(event:any) {
    this.hideModal();
  }

  private switchToFree(event:any) {
    this.logger.info(this, "switchToFree");
    let modal = this.showModal(SettingsSwitchtofreePage);
  }

  private switchToPro(event:any) {
    this.logger.info(this, "switchToPro");
    this.switchToProModal = this.showModal(SettingsSwitchtoproPage);
  }
}
