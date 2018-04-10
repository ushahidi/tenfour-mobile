import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { AppAvailability } from '@ionic-native/app-availability';

import { BasePage } from '../../pages/base-page/base-page';
import { SignupConfirmPage } from '../../pages/signup-confirm/signup-confirm';

import { ApiService } from '../../providers/api-service';

import { Organization } from '../../models/organization';
import { Email } from '../../models/email';

@IonicPage()
@Component({
  selector: 'page-signup-check',
  templateUrl: 'signup-check.html',
  providers: [ ApiService ],
  entryComponents:[ SignupConfirmPage ]
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
      protected api:ApiService,
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
    this.appAvailability.check(app).then(
      (yes:any) => {
        this.mailer = true;
      },
      (no:any) => {
        this.mailer = false;
      });
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

  private showNext(event:any) {
    this.showPage(SignupConfirmPage,
      { organization: this.organization });
  }

  private sendEmail(event:any) {
    let loading = this.showLoading("Resending...");
    this.api.registerEmail(this.organization.email).then(
      (email:Email) => {
        loading.dismiss();
      },
      (error:any) => {
        loading.dismiss();
        this.showAlert("Email Verification", error);
      });
  }

}
