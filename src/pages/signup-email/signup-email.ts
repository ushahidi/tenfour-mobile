import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiService } from '../../providers/api-service';

import { SignupCheckPage } from '../../pages/signup-check/signup-check';

import { Email } from '../../models/email';
import { Organization } from '../../models/organization';

@IonicPage()
@Component({
  selector: 'page-signup-email',
  templateUrl: 'signup-email.html',
  providers: [ ApiService ],
  entryComponents:[ SignupCheckPage ]
})
export class SignupEmailPage extends BasePage {

  @ViewChild('email')
  email:TextInput;

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

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.trackPage();
  }

  private showNext(event) {
    this.logger.info(this, "showNext");
    if (this.email.value && this.email.value.length > 0) {
      let loading = this.showLoading("Registering...");
      this.api.registerEmail(this.email.value).then(
        (email:Email) => {
          loading.dismiss();
          let organization = new Organization({});
          organization.email = this.email.value;
          this.showPage(SignupCheckPage,
            { organization: organization });
        },
        (error:any) => {
          loading.dismiss();
          this.showAlert("Email Verification", error);
        });
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
