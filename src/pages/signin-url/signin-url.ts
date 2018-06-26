import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePublicPage } from '../../pages/base-public-page/base-public-page';

import { SigninEmailPage } from '../../pages/signin-email/signin-email';
import { SignupEmailPage } from '../../pages/signup-email/signup-email';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'SigninUrlPage',
  segment: 'signin'
})
@Component({
  selector: 'page-signin-url',
  templateUrl: 'signin-url.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ SigninEmailPage, SignupEmailPage ]
})
export class SigninUrlPage extends BasePublicPage {

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
      protected api:ApiProvider,
      protected storage:StorageProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.analytics.trackPage(this);
  }

  private showNext(event:any) {
    this.logger.info(this, "showNext", this.subdomain.value);
    if (this.subdomain.value && this.subdomain.value.length > 0) {
      let subdomain = this.subdomain.value.toLowerCase();
      let loading = this.showLoading("Searching...", true);
      this.api.getOrganizations(subdomain).then((organizations:Organization[]) => {
        this.logger.info(this, "showNext", organizations);
        loading.dismiss();
        if (organizations && organizations.length > 0) {
          let organization:Organization = organizations[0];
          this.storage.setOrganization(organization).then((stored:boolean) => {
            this.showPage(SigninEmailPage, {
              organization: organization
            });
          });
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
    this.showPage(SignupEmailPage, {});
  }

  private showNextOnReturn(event:any) {
    if (this.isKeyReturn(event)) {
      this.hideKeyboard();
      this.showNext(event);
      return false;
    }
    return true;
  }

}
