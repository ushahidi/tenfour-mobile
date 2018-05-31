import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { SignupOwnerPage } from '../../pages/signup-owner/signup-owner';

import { Organization } from '../../models/organization';
import { Email } from '../../models/email';

import { ApiProvider } from '../../providers/api/api';
import { MailerProvider } from '../../providers/mailer/mailer';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'SignupCheckPage',
  segment: 'signup-check',
  defaultHistory: ['SigninUrlPage', 'SignupEmailPage']
})
@Component({
  selector: 'page-signup-verify',
  templateUrl: 'signup-verify.html',
  providers: [ ApiProvider, StorageProvider, MailerProvider ],
  entryComponents:[ SignupOwnerPage ]
})
export class SignupVerifyPage extends BasePage  {

  organization:Organization = null;
  email:string = null;
  token:string = null;
  loading:boolean = false;
  verified:boolean = false;

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
      protected mailer:MailerProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
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
      .then(() => { return this.loadEmail(); })
      .then(() => { return this.loadToken(); })
      .then(() => { return this.verifyEmail(); })
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

  private loadEmail():Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.hasParameter("email")) {
        this.email = this.getParameter<string>("email");
        resolve(this.email);
      }
      else {
        this.email = null;
        resolve(null);
      }
    })
  }

  private loadToken():Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.hasParameter("token")){
        this.token = this.getParameter<string>("token");
        resolve(this.token);
      }
      else {
        this.token = null;
        resolve(null);
      }
    })
  }

  private verifyEmail() {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "verifyEmail", "Email", this.email, "Token", this.token);
      if (this.email && this.email.length > 0 && this.token && this.token.length > 0) {
        let loading = this.showLoading("Verifying...", true);
        this.api.verifyEmail(this.email, this.token).then((_email:Email) => {
          this.logger.info(this, "verifyEmail", "Email", this.email, "Token", this.token, "Verified");
          loading.dismiss();
          this.verified = true;
          resolve(true);
        },
        (error:any) => {
          this.logger.info(this, "verifyEmail", "Email", this.email, "Token", this.token, "Failed");
          loading.dismiss();
          this.verified = false;
          resolve(false);
        });
      }
      else {
        this.verified = false;
        resolve(false);
      }
    });
  }

  private showSignupOwner(event:any=null) {
    let organization = new Organization({
      email: this.email
    });
    this.showPage(SignupOwnerPage, {
      organization: organization
    });
  }

  private returnPrevious(event:any=null) {
    this.closePage();
  }

}
