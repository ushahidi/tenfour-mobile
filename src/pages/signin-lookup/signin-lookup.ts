import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePublicPage } from '../../pages/base-public-page/base-public-page';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';
import { EnvironmentProvider } from '../../providers/environment/environment';

@IonicPage({
  name: 'SigninLookupPage',
  segment: 'signin'
})
@Component({
  selector: 'page-signin-lookup',
  templateUrl: 'signin-lookup.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ ]
})
export class SigninLookupPage extends BasePublicPage {

  @ViewChild('email')
  email:TextInput;
  sent:boolean = false;
  sentToEmail:string;

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
      protected environment:EnvironmentProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.analytics.trackPage(this);
  }
  private showNext(event:any) {
    this.logger.info(this, "showNext", this.email.value);
    if (this.email.value.length == 0) {
      this.showToast("Please enter your email");
      setTimeout(() => {
        this.email.setFocus();
      }, 500);
    }
    else if (this.email.value.indexOf("@") == -1) {
      this.showToast("Please enter a valid email");
      setTimeout(() => {
        this.email.setFocus();
      }, 500);
    }
    else {
      this.sentToEmail = this.email.value;
      let loading = this.showLoading("Sending recovery email...", true);

      this.api.lookupOrganization(this.sentToEmail).then(() => {
        this.sent = true;
        loading.dismiss();
      }, (error:any) => {
        loading.dismiss();
        this.showAlert("Problem Sending Recovery email", error);
      })
    }
  }

  private showNextOnReturn(event:any) {
    if (this.isKeyReturn(event)) {
      this.hideKeyboard();
      this.showNext(event);
      return false;
    }
    return true;
  }
}
