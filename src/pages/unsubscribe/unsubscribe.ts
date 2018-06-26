import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePublicPage } from '../../pages/base-public-page/base-public-page';
import { SigninUrlPage } from '../signin-url/signin-url';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'UnsubscribePage',
  segment: 'unsubscribe/:email/:token/:org_name',
  defaultHistory: ['SigninUrlPage']
})
@Component({
  selector: 'page-unsubscribe',
  templateUrl: 'unsubscribe.html',
  providers: [ ApiProvider ]
})
export class UnsubscribePage extends BasePublicPage {

  organization:string = null;
  token:string = null;
  email:string = null;

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
    this.organization = this.getParameter<string>("org_name");
    this.token = this.getParameter<string>("token");
    this.email = this.getParameter<string>("email");
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.analytics.trackPage(this);
  }

  private confirm(event:any) {
    this.logger.info(this, "confirm");

    if (this.email && this.token) {
      let loading = this.showLoading("Unsubscribing...", true);
      this.api.unsubscribeEmail(this.email, this.token).then(() => {
        loading.dismiss();
        this.showToast("The email address has been unsubscribed");
      },
      (error:any) => {
        loading.dismiss();
        this.showAlert("There was an problem unsubscribing this email address. Please contact support.", error);
      });
    }
  }

  private done(event:any) {
    this.showPage(SigninUrlPage, {});
  }

}
