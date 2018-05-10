import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { SigninEmailPage } from '../../pages/signin-email/signin-email';
import { SignupEmailPage } from '../../pages/signup-email/signup-email';

import { ApiProvider } from '../../providers/api/api';

import { Organization } from '../../models/organization';

@IonicPage()
@Component({
  selector: 'page-signin-url',
  templateUrl: 'signin-url.html',
  providers: [ ApiProvider ],
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
      protected api:ApiProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.trackPage();
  }

  private showNext(event:any) {
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

  private createOrganization(event:any) {
    this.logger.info(this, "createOrganization");
    if (this.platform.is("ios")) {
      this.showUrl("https://app.tenfour.org/organization/email", "_system");
      // this.showPage(SignupEmailPage, {});
    }
    else {
      this.showPage(SignupEmailPage, {});
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
