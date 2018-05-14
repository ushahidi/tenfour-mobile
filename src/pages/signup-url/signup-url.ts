import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput,
         Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { SignupPlanPage } from '../../pages/signup-plan/signup-plan';

import { ApiProvider } from '../../providers/api/api';

import { Organization } from '../../models/organization';

@IonicPage({
  segment: 'signup/url',
  defaultHistory: ['signup']
})
@Component({
  selector: 'page-signup-url',
  templateUrl: 'signup-url.html',
  providers: [ ApiProvider ],
  entryComponents:[ SignupPlanPage ]
})
export class SignupUrlPage extends BasePage {

  @ViewChild('subdomain')
  subdomain:TextInput;

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
    this.logger.info(this, "showNext");
    let loading = this.showLoading("Checking...");
    this.api.getOrganizations(this.subdomain.value).then((organizations:Organization[]) => {
      this.logger.error(this, "showNext", organizations);
      loading.dismiss();
      if (organizations && organizations.length > 0) {
        this.showAlert("Organization URL Exists", "Sorry, the organization already exists. Please choose another subdomain.");
      }
      else {
        this.organization.subdomain = this.subdomain.value;
        this.showPage(SignupPlanPage, {
          organization: this.organization
        });
      }
    },
    (error:any) => {
      this.logger.info(this, "showNext", error);
      loading.dismiss();
      this.showAlert("Organization URL", error);
    });
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
