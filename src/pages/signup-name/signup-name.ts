import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput,
         Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { SignupUrlPage } from '../../pages/signup-url/signup-url';

import { ApiService } from '../../providers/api-service';

import { Organization } from '../../models/organization';

@IonicPage()
@Component({
  selector: 'page-signup-name',
  templateUrl: 'signup-name.html',
  providers: [ ApiService ],
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
      protected api:ApiService) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
  }

  showNext(event) {
    this.logger.info(this, "showNext");
    let name = this.name.value;
    let loading = this.showLoading("Loading...");
    this.api.getOrganizations(null, name).then(
      (organizations:Organization[]) => {
        this.logger.error(this, "showNext", organizations);
        loading.dismiss();
        if (organizations && organizations.length > 0) {
          this.showAlert("Organization Name Exists", "Sorry, the organization already exists. Please choose another name.");
        }
        else {
          this.organization.organization_name = name;
          this.showPage(SignupUrlPage,
            { organization: this.organization });
        }
      },
      (error:any) => {
        this.logger.info(this, "showNext", error);
        loading.dismiss();
        this.showAlert("Organization Name", error);
      });
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
