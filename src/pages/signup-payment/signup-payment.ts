import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput,
         Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { SignupPasswordPage } from '../../pages/signup-password/signup-password';

import { ApiService } from '../../providers/api-service';

import { Organization } from '../../models/organization';

@IonicPage()
@Component({
  selector: 'page-signup-payment',
  templateUrl: 'signup-payment.html',
  providers: [ ApiService ],
  entryComponents:[ SignupPasswordPage ]
})
export class SignupPaymentPage extends BasePage {

  organization:Organization;
  paypal:boolean = null;

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
      protected actionController:ActionSheetController) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
  }

  showNext(event) {
    this.logger.info(this, "showNext");
    this.showPage(SignupPasswordPage,
      { organization: this.organization });
  }

  selectPaypal(event:any) {
    this.logger.info(this, "selectPaypal");
    this.paypal = true;
  }

  selectCreditCard(event:any) {
    this.logger.info(this, "selectCreditCard");
    this.paypal = false;
  }

}
