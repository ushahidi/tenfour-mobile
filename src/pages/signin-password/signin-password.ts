import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { RollcallListPage } from '../../pages/rollcall-list/rollcall-list';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Token } from '../../models/token';
import { Organization } from '../../models/organization';

@IonicPage()
@Component({
  selector: 'page-signin-password',
  templateUrl: 'signin-password.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[  RollcallListPage ]
})
export class SigninPasswordPage extends BasePage {

  @ViewChild('password')
  password:TextInput;

  organization:Organization = null;
  email:string = null;

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
      protected api:ApiService,
      protected database:DatabaseService) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.email = this.getParameter<string>("email");
  }

  showNext(event) {
    this.logger.info(this, "showNext");
    if (this.password.value && this.password.value.length > 0) {
      let loading = this.showLoading("Logging in...");
      let password = this.password.value;
      this.api.userLogin(this.email, password).then(
        (token:Token) => {
          this.logger.info(this, "showNext", "User Token", token);
          this.database.saveOrganization(this.organization).then((saved:any) => {
            this.logger.info(this, "showNext", "Organization Saved", saved);
            this.database.saveToken(token).then((saved:any) => {
              this.logger.info(this, "showNext", "Token Saved", saved);
              loading.dismiss();
              this.showToast("Logged in");
              this.showRootPage(RollcallListPage,
                { organization: this.organization });
            });
          });
        },
        (error:any) => {
          this.logger.error(this, "showNext", error);
          loading.dismiss();
          this.showAlert("Login Unsuccessful", "Invalid email and/or password, please try again.");
        });
    }
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
