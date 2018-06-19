import { Component,  NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { Email } from '../../models/email';

import { ApiProvider } from '../../providers/api/api';
import { DatabaseProvider } from '../../providers/database/database';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'PasswordResetPage',
  segment: 'login/reset-password/:token/:email/:subdomain',
  defaultHistory: ['SigninUrlPage']
})
@Component({
  selector: 'page-password-reset',
  templateUrl: 'password-reset.html',
  providers: [ ApiProvider, DatabaseProvider, StorageProvider ],
})
export class PasswordResetPage extends BasePage {

  @ViewChild('password')
  newpassword:TextInput;

  @ViewChild('confirm')
  confirm:TextInput;

  email:string = null;
  token:string = null;
  loading:boolean = false;

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
      protected database:DatabaseProvider) {
      super(zone,platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
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

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    this.loading = true;
    return Promise.resolve()
      .then(() => { return this.loadEmail(); })
      .then(() => { return this.loadToken(); })
      .then(() => { return this.passwordReset(); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Loaded");
        if (event) {
          event.complete();
        }
        this.loading = false;
      })
      .catch((error) => {
        this.logger.error(this, "loadUpdates", "Failed", error);
        if (event) {
          event.complete();
        }
        this.loading = false;
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

  private loadToken():Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.hasParameter("token")){
        this.token = this.getParameter<string>("token");
        resolve(this.token);
      }
      else {
        this.token = null;
        reject("Token not provided");
      }
    })
  }

  private passwordReset() {
    this.logger.info(this, "PasswordReset");
    if (this.newpassword.value.length < 6) {
      this.showToast("Password is too short");
    }
    else if (this.newpassword.value != this.confirm.value) {
      this.showToast("Passwords do not match");
    }
    else {
      let loading = this.showLoading("Reseting...");
      let password = this.newpassword.value;
      this.api.postResetPassword(this.token, this.email, password).then((_email:Email) => {
        this.logger.info(this, "passwordReset", "Email", this.email);
        resolve(true);
      },
      (error:any) => {
        this.logger.error(this, "passwordReset", error);
        loading.dismiss();
        this.showAlert("Problem Reseting password", error);
      });
    }
  }

}
