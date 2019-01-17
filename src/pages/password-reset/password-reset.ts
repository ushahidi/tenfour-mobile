import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController, Alert } from 'ionic-angular';

import { BasePublicPage } from '../../pages/base-public-page/base-public-page';

import { Organization } from '../../models/organization';

import { SigninUrlPage } from '../../pages/signin-url/signin-url';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'PasswordResetPage',
  segment: 'signin/password/reset/:subdomain/:email/:token',
  defaultHistory: ['SigninUrlPage']
})
@Component({
  selector: 'page-password-reset',
  templateUrl: 'password-reset.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ SigninUrlPage ]
})
export class PasswordResetPage extends BasePublicPage {

  @ViewChild('password')
  password:TextInput;

  @ViewChild('confirm')
  confirm:TextInput;

  subdomain:string = null;
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
      protected storage:StorageProvider) {
      super(zone,platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();

    if (!this.modal) {
      this.loading=true;
      this.showModal(PasswordResetPage, {
        token: this.getParameter('token'),
        subdomain: this.getParameter('subdomain'),
        email: this.getParameter('email')
      }, {enableBackdropDismiss: false});
    }

    let loading = this.showLoading("Loading...");
    this.loadUpdates(true).then((loaded:any) => {
      loading.dismiss();
    });
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    this.loading = true;
    return Promise.resolve()
      .then(() => { return this.loadSubdomain(); })
      .then(() => { return this.loadEmail(); })
      .then(() => { return this.loadToken(); })
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

  private loadSubdomain():Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.hasParameter("subdomain")) {
        this.subdomain = this.getParameter<string>("subdomain");
        resolve(this.subdomain);
      }
      else {
        this.subdomain = null;
        reject("Subdomain not provided");
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
        reject("Email not provided");
      }
    });
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
    });
  }

  private passwordReset() {
    this.logger.info(this, "passwordReset");
    if (this.password.value.length < 6) {
      this.showToast("Password is too short");
      setTimeout(() => {
        this.password.setFocus();
      }, 500);
    }
    else if (this.password.value !== this.confirm.value) {
      this.showToast("Passwords do not match");
      setTimeout(() => {
        this.confirm.setFocus();
      }, 500);
    }
    else {
      let loading = this.showLoading("Resetting...");
      let password = this.password.value;
      this.api.updatePassword(this.subdomain, this.token, this.email, password).then((updated:boolean) => {
        this.logger.info(this, "passwordReset", updated);
        loading.dismiss();
        let alert = this.showAlert("Password Reset", "Your password has been reset.");
        alert.onDidDismiss((data:any) => {
          this.hideModal();
          this.showRootPage(SigninUrlPage);
        });
      },
      (error:any) => {
        this.logger.error(this, "passwordReset", error);
        loading.dismiss();
        this.showAlert("Problem Resetting Password", error);
      });
    }
  }

  private nextOnReturn(event:any) {
    if (this.isKeyReturn(event)) {
      if (this.password.value.length == 0) {
        this.password.setFocus();
      }
      else if (this.confirm.value.length == 0) {
        this.confirm.setFocus();
      }
      else {
        this.hideKeyboard();
        this.passwordReset();
      }
      return false;
    }
    return true;
  }

}
