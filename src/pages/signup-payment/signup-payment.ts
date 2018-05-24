import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput,
         Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { SignupPasswordPage } from '../../pages/signup-password/signup-password';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'SignupPaymentPage',
  segment: 'signup/payment',
  defaultHistory: ['SignupEmailPage']
})
@Component({
  selector: 'page-signup-payment',
  templateUrl: 'signup-payment.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ SignupPasswordPage ]
})
export class SignupPaymentPage extends BasePage {

  organization:Organization;

  @ViewChild('number')
  number:TextInput;

  @ViewChild('expiry')
  expiry:TextInput;

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
    this.organization = this.getParameter<Organization>("organization");
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.analytics.trackPage();
  }

  private showNext(event:any) {
    this.logger.info(this, "showNext");
    this.showPage(SignupPasswordPage, {
      organization: this.organization
    });
  }

  private showNextOnReturn(event:any) {
    if (event.keyCode == 13) {
      if (this.number.value.length == 0) {
        this.number.setFocus();
      }
      else if (this.expiry.value.length == 0) {
        this.expiry.setFocus();
      }
      else {
        this.hideKeyboard();
        this.showNext(event);
      }
      return false;
    }
    return true;
  }

}
