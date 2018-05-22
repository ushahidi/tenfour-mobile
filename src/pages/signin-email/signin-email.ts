import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { SigninPasswordPage } from '../../pages/signin-password/signin-password';

import { Organization } from '../../models/organization';

import { ApiProvider } from '../../providers/api/api';

@IonicPage({
  name: 'SigninEmailPage',
  segment: 'signin/email',
  defaultHistory: ['SigninUrlPage']
})
@Component({
  selector: 'page-signin-email',
  templateUrl: 'signin-email.html',
  providers: [ ApiProvider ],
  entryComponents:[ SigninPasswordPage ]
})
export class SigninEmailPage extends BasePage {

  @ViewChild('email')
  email:TextInput;
  logo:string = "assets/images/dots.png";
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
      protected api:ApiProvider) {
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

  private showNext(event:any) {
    this.logger.info(this, "showNext", this.email.value);
    if (this.email.value && this.email.value.length > 0) {
      let email = this.email.value;
      this.showPage(SigninPasswordPage, {
        organization: this.organization,
        email: email
      });
    }
  }

  private showNextOnReturn(event:any) {
    if (event.keyCode == 13) {
      this.hideKeyboard();
      this.showNext(event);
      return false;
    }
    return true;
  }

}
