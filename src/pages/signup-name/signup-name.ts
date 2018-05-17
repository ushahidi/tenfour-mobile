import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput,
         Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { SignupUrlPage } from '../../pages/signup-url/signup-url';

import { ApiProvider } from '../../providers/api/api';

import { Organization } from '../../models/organization';

@IonicPage({
  segment: 'signup/name',
  defaultHistory: ['SignupEmailPage']
})
@Component({
  selector: 'page-signup-name',
  templateUrl: 'signup-name.html',
  providers: [ ApiProvider ],
  entryComponents:[ SignupUrlPage ]
})
export class SignupNamePage extends BasePage {

  @ViewChild('name')
  name:TextInput;

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
    let loading = this.showLoading("Loading...");
    this.api.getOrganizations(null, this.name.value).then((organizations:Organization[]) => {
      this.logger.error(this, "showNext", organizations);
      loading.dismiss();
      if (organizations && organizations.length > 0) {
        this.showAlert("Organization Name Exists", "Sorry, the organization already exists. Please choose another name.");
      }
      else {
        this.organization.name = this.name.value;
        this.showPage(SignupUrlPage, {
          organization: this.organization
        });
      }
    },
    (error:any) => {
      this.logger.info(this, "showNext", error);
      loading.dismiss();
      this.showAlert("Organization Name", error);
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
