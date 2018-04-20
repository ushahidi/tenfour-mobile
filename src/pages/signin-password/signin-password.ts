import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { CheckinListPage } from '../../pages/checkin-list/checkin-list';
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
  entryComponents:[ CheckinListPage, OnboardListPage ]
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

  private showNext(event:any) {
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
                this.trackLogin(organization, person);
                loading.dismiss();
                if (person.name && person.name.length > 0) {
                  this.showToast(`Hello ${person.name}, welcome to ${organization.name}`);
                }
                else {
                  this.showToast(`Welcome to ${organization.name}`);
                }
                if (person.config_profile_reviewed && person.config_self_test_sent) {
                  this.showRootPage(CheckinListPage,
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

  private resetPassword(event:any) {
    let loading = this.showLoading("Resetting...");
    this.api.resetPassword(this.organization.subdomain, this.email).then((reset:any) => {
      loading.dismiss();
      this.showAlert("Password Reset Sent", `Password reset information sent to ${this.email}, please follow the instructions in the email.`);
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Resetting Password", "Your password could not be reset, please double check the email you entered and try again.");
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
