import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { AppAvailability } from '@ionic-native/app-availability';

import { BasePage } from '../../pages/base-page/base-page';
import { SignupOwnerPage } from '../../pages/signup-owner/signup-owner';

import { ApiProvider } from '../../providers/api/api';

import { Organization } from '../../models/organization';
import { Email } from '../../models/email';

@IonicPage({
  segment: 'signup-check',
  defaultHistory: ['SignupEmailPage']
})
@Component({
  selector: 'page-signup-check',
  templateUrl: 'signup-check.html',
  providers: [ ApiProvider ],
  entryComponents:[ SignupOwnerPage ]
})
export class SignupCheckPage extends BasePage {

  mailer:boolean = true;
  mailerApple:string = "mailto://";
  mailerAndroid:string = "com.android.email";
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
      protected api:ApiProvider,
      protected appAvailability:AppAvailability) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    if (this.platform.is('ios')) {
      this.checkMail(this.mailerApple);
    }
    else if (this.platform.is('android')) {
      this.checkMail(this.mailerAndroid);
    }
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.trackPage();
  }

  private checkMail(app:string) {
    if (this.mobile) {
      this.appAvailability.check(app).then(
        (yes:any) => {
          this.mailer = true;
        },
        (no:any) => {
          this.mailer = false;
        });
    }
    else {
      this.mailer = false;
    }
  }

  private openMail(event:any) {
    this.logger.info(this, "openMail");
    if (this.platform.is('ios')) {
      this.showUrl(this.mailerApple, '_system');
    }
    else if (this.platform.is('android')) {
      this.showUrl(this.mailerAndroid, '_system');
    }
  }

  private sendEmail(event:any) {
    let loading = this.showLoading("Resending...");
    this.api.registerEmail(this.organization.email).then((email:Email) => {
      loading.dismiss();
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Email Verification", error);
    });
  }

}
