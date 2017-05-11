import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { SigninEmailPage } from '../../pages/signin-email/signin-email';
import { SignupEmailPage } from '../../pages/signup-email/signup-email';

import { ApiService } from '../../providers/api-service';

import { Organization } from '../../models/organization';

@IonicPage()
@Component({
  selector: 'page-signin-url',
  templateUrl: 'signin-url.html',
  providers: [ ApiService ],
  entryComponents:[ SigninEmailPage, SignupEmailPage ]
})
export class SigninUrlPage extends BasePage {

  @ViewChild('subdomain')
  subdomain:TextInput;

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

  showNext(event) {
    this.logger.info(this, "showNext", this.subdomain.value);
    if (this.subdomain.value && this.subdomain.value.length > 0) {
      let subdomain = this.subdomain.value.toLowerCase();
      let loading = this.showLoading("Searching...");
      this.api.getOrganizations(subdomain).then(
        (organizations:Organization[]) => {
          this.logger.info(this, "showNext", organizations);
          loading.dismiss();
          if (organizations && organizations.length > 0) {
            let organization:Organization = organizations[0];
            this.showPage(SigninEmailPage,
              { organization: organization });
          }
          else {
            this.showPage(SignupEmailPage, {});
          }
        },
        (error:any) => {
          this.logger.error(this, "showNext", error);
          loading.dismiss();
          this.showAlert("Problem Finding Organization", error);
        });
    }
  }

  createOrganization(event) {
    this.logger.info(this, "createOrganization");
    this.showPage(SignupEmailPage, {});
  }

  onKeyPress(event) {
    if (event.keyCode == 13) {
      this.hideKeyboard();
      this.showNext(event);
      return false;
    }
    return true;
  }

}
