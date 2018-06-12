import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput,
         Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { SignupPaymentPage } from '../../pages/signup-payment/signup-payment';
import { SignupPasswordPage } from '../../pages/signup-password/signup-password';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'SignupPlanPage',
  segment: 'signup/plan',
  defaultHistory: ['SigninUrlPage', 'SignupEmailPage', 'SignupOwnerPage', 'SignupNamePage', 'SignupUrlPage']
})
@Component({
  selector: 'page-signup-plan',
  templateUrl: 'signup-plan.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ SignupPaymentPage, SignupPasswordPage ]
})
export class SignupPlanPage extends BasePage {

  trial:boolean = false;
  organization:Organization;

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
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    let loading = this.showLoading("Loading...");
    this.loadUpdates(true).then((loaded:any) => {
      loading.dismiss();
    },
    (error:any) => {
      loading.dismiss();
      this.showToast(error);
    });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.analytics.trackPage(this);
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    return Promise.resolve()
      .then(() => { return this.loadOrganization(cache); })
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
        },
        (error:any) => {
          this.organization = null;
          resolve(null);
        });
      }
    });
  }

  private showNext(event:any) {
    if (this.trial) {
      this.logger.info(this, "showNext", "SignupPasswordPage");
      this.showPage(SignupPasswordPage, {
        organization: this.organization
      });
    }
    else {
      this.logger.info(this, "showNext", "SignupPaymentPage");
      this.showPage(SignupPaymentPage, {
        organization: this.organization
      });
    }
  }

  private startPlan(event:any) {
    this.logger.info(this, "startPlan");
    this.trial = false;
  }

  private startTrial(event:any) {
    this.logger.info(this, "startTrial");
    this.trial = true;
  }

  private needMore(event:any) {
    this.logger.info(this, "needMore");
  }

}
