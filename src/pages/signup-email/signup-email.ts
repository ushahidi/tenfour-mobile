import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePublicPage } from '../../pages/base-public-page/base-public-page';

import { SignupCheckPage } from '../../pages/signup-check/signup-check';

import { Email } from '../../models/email';
import { Organization } from '../../models/organization';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'SignupEmailPage',
  segment: 'signup',
  defaultHistory: ['SigninUrlPage']
})
@Component({
  selector: 'page-signup-email',
  templateUrl: 'signup-email.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ SignupCheckPage ]
})
export class SignupEmailPage extends BasePublicPage {

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
      protected api:ApiProvider,
      protected storage:StorageProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.analytics.trackPage(this);
  }

  private showNext(event:any) {
    this.logger.info(this, "showNext");
    if (this.email.value && this.email.value.length > 0) {
      let loading = this.showLoading("Registering...", true);
      this.api.registerEmail(this.email.value).then((email:Email) => {
        loading.dismiss();
        let organization = new Organization({});
        organization.email = this.email.value;
        this.storage.setOrganization(organization).then((stored:boolean) => {
          this.showPage(SignupCheckPage, {
            organization: organization
          });
        });
      },
      (error:any) => {
        loading.dismiss();
        this.showAlert("Email Signup", error);
      });
    }
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
