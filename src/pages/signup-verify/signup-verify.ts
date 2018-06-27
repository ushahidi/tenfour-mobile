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
  name: 'SignupVerifyPage',
  segment: 'signup/verify/:email/:code',
  defaultHistory: ['SigninUrlPage', 'SignupEmailPage']
})
@Component({
  selector: 'page-signup-verify',
  templateUrl: 'signup-verify.html',
  providers: [ ApiProvider, StorageProvider, MailerProvider ],
  entryComponents:[ SignupOwnerPage ]
})
export class SignupVerifyPage extends BasePage  {

  email:string = null;
  code:string = null;
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
      protected mailer:MailerProvider,
      protected storage:StorageProvider) {
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
    });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.analytics.trackPage(this);
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    this.loading = true;
    this.verified = false;
    return Promise.resolve()
      .then(() => { return this.loadEmail(); })
      .then(() => { return this.loadCode(); })
      .then(() => { return this.verifyEmail(); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Loaded");
        if (event) {
          event.complete();
        }
        this.loading = false;
        this.verified = true;
      })
      .catch((error) => {
        this.logger.error(this, "loadUpdates", "Failed", error);
        if (event) {
          event.complete();
        }
        this.loading = false;
        this.verified = false;
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
        reject("Email not provided");
      }
    })
  }

  private loadCode():Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.hasParameter("code")){
        this.code = this.getParameter<string>("code");
        resolve(this.code);
      }
      else {
        this.code = null;
        reject("Code not provided");
      }
    })
  }

  private verifyEmail() {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "verifyEmail", "Email", this.email, "Code", this.code);
      if (this.email && this.email.length > 0 && this.code && this.code.length > 0) {
        this.api.verifyEmail(this.email, this.code).then((_email:Email) => {
          this.logger.info(this, "verifyEmail", "Email", this.email, "Code", this.code, "Verified");
          resolve(true);
        },
        (error:any) => {
          this.logger.info(this, "verifyEmail", "Email", this.email, "Code", this.code, "Failed");
          reject(error);
        });
      }
      else {
        reject("Email and code not provided");
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
