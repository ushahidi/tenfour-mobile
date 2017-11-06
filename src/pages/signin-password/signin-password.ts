import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { RollcallListPage } from '../../pages/rollcall-list/rollcall-list';
import { OnboardListPage } from '../../pages/onboard-list/onboard-list';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Token } from '../../models/token';
import { Organization } from '../../models/organization';
import { Person } from '../../models/person';

@IonicPage()
@Component({
  selector: 'page-signin-password',
  templateUrl: 'signin-password.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[ RollcallListPage, OnboardListPage ]
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
      this.api.userLogin(this.organization, this.email, password).then(
        (token:Token) => {
          this.logger.info(this, "showNext", "Token", token);
          this.api.getPerson(this.organization, "me").then((person:Person) => {
            this.logger.info(this, "showNext", "Person", person);
            this.api.getOrganization(this.organization).then((organization:Organization) => {
              this.logger.info(this, "showNext", "Organization", organization);
              organization.user_id = person.id;
              organization.user_name = person.name;
              organization.email = this.email;
              organization.password = password;
              let saves = [
                this.database.saveOrganization(organization),
                this.database.savePerson(organization, person)];
              Promise.all(saves).then(saved => {
                loading.dismiss();
                this.showToast(`Welcome to ${organization.name}`);
                if (person.config_profile_reviewed && person.config_self_test_sent) {
                  this.showRootPage(RollcallListPage,
                    { organization: organization });
                }
                else {
                  this.showRootPage(OnboardListPage,
                    { organization: organization,
                      person: person });
                }
              });
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
