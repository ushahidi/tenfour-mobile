import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput,
         Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { SignupNamePage } from '../../pages/signup-name/signup-name';

import { ApiService } from '../../providers/api-service';

import { Organization } from '../../models/organization';

@IonicPage()
@Component({
  selector: 'page-signup-owner',
  templateUrl: 'signup-owner.html',
  providers: [ ApiService ],
  entryComponents:[ SignupNamePage ]
})
export class SignupOwnerPage extends BasePage {

  @ViewChild('owner')
  owner:TextInput;

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
    this.organization = this.getParameter<Organization>("organization");
  }

  showNext(event) {
    this.logger.info(this, "showNext");
    this.organization.name = this.owner.value;
    this.showPage(SignupNamePage,
      { organization: this.organization });
  }

  showNextOnReturn(event) {
    if (event.keyCode == 13) {
      this.hideKeyboard();
      this.showNext(event);
      return false;
    }
    return true;
  }

}
