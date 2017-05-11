import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput,
         Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { RollcallListPage } from '../../pages/rollcall-list/rollcall-list';

import { ApiService } from '../../providers/api-service';

import { Token } from '../../models/token';
import { Organization } from '../../models/organization';

@IonicPage()
@Component({
  selector: 'page-signup-password',
  templateUrl: 'signup-password.html',
  providers: [ ApiService ],
  entryComponents:[  RollcallListPage ]
})
export class SignupPasswordPage extends BasePage {

  @ViewChild('password')
  password:TextInput;

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
  }

  createOrganization(event) {
    this.logger.info(this, "showNext");
    let loading = this.showLoading("Creating...");
    this.api.clientLogin().then(
      (token:Token) => {
        this.logger.info(this, "createOrganization", "Client Token", token);
        this.organization.password = this.password.value;
        this.api.createOrganization(token, this.organization).then(
          (organization:Organization) => {
            this.logger.info(this, "createOrganization", "Organization", organization);
            this.api.userLogin(this.organization.email, this.organization.password).then(
              (token:Token) => {
                this.logger.info(this, "createOrganization", "User Token", token);
                loading.dismiss();
                this.showToast("Organization created");
                this.showRootPage(RollcallListPage,
                  { organization: organization });
              },
              (error:any) => {
                loading.dismiss();
                this.showAlert("User Token Error", error);
              });
          },
          (error:any) => {
            this.logger.error(this, "createOrganization", error);
            loading.dismiss();
            this.showAlert("Problem Creating Organization", error);
          });
        },
        (error:any) => {
          loading.dismiss();
          this.showAlert("Client Token Error", error);
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
