import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { SignupOwnerPage } from '../../pages/signup-owner/signup-owner';

import { ApiService } from '../../providers/api-service';

import { Organization } from '../../models/organization';

@IonicPage()
@Component({
  selector: 'page-signup-confirm',
  templateUrl: 'signup-confirm.html',
  providers: [ ApiService ],
  entryComponents:[ SignupOwnerPage ]
})
export class SignupConfirmPage extends BasePage {

  email:string;
  organization:Organization;

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
    this.email = this.getParameter<string>("email");
    this.organization = this.getParameter<Organization>("organization");
    if (this.organization == null) {
      this.organization = new Organization();
      this.organization.email = this.email;
    }
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.trackPage();
  }

  private confirmEmail(name:string) {
    let loading = this.showLoading("Confirming...");
    this.api.checkEmail(this.organization.email).then(
      (data:any) => {
        loading.dismiss();
        this.showPage(SignupOwnerPage,
          { organization: this.organization });
      },
      (error:any) => {
        loading.dismiss();
        this.showAlert("Email Confirmation", error);
      });
  }

}
