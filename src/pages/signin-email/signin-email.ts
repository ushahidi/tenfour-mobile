import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { SigninPasswordPage } from '../../pages/signin-password/signin-password';

import { ApiService } from '../../providers/api-service';

import { Organization } from '../../models/organization';

@IonicPage()
@Component({
  selector: 'page-signin-email',
  templateUrl: 'signin-email.html',
  providers: [ ApiService ],
  entryComponents:[ SigninPasswordPage ]
})
export class SigninEmailPage extends BasePage {

  @ViewChild('email')
  email:TextInput;

  organization:Organization = null;

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
      protected api:ApiService) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.trackPage();
  }

  private showNext(event) {
    this.logger.info(this, "showNext");
    if (this.email.value && this.email.value.length > 0) {
      let email = this.email.value;
      this.showPage(SigninPasswordPage,
        { organization: this.organization,
          email: email });
    }
  }

  private showNextOnReturn(event) {
    if (event.keyCode == 13) {
      this.hideKeyboard();
      this.showNext(event);
      return false;
    }
    return true;
  }

}
