import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Events, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { CheckinListPage } from '../../pages/checkin-list/checkin-list';
import { OnboardListPage } from '../../pages/onboard-list/onboard-list';

import { Token } from '../../models/token';
import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';
import { DatabaseProvider } from '../../providers/database/database';

@IonicPage({
  name: 'SigninPasswordPage',
  segment: 'signin/password',
  defaultHistory: ['SigninUrlPage', 'SigninEmailPage']
})
@Component({
  selector: 'page-signin-password',
  templateUrl: 'signin-password.html',
  providers: [ ApiProvider, DatabaseProvider, StorageProvider ],
  entryComponents:[ CheckinListPage, OnboardListPage ]
})
export class SigninPasswordPage extends BasePage {

  @ViewChild('password')
  password:TextInput;

  organization:Organization = null;
  email:string = null;
  logo:string = "assets/images/dots.png";

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
      protected events:Events,
      protected api:ApiProvider,
      protected storage:StorageProvider,
      protected database:DatabaseProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.email = this.getParameter<string>("email");
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.trackPage();
  }

  private showNext(event:any) {
    this.logger.info(this, "showNext");
    if (this.password.value && this.password.value.length > 0) {
      let loading = this.showLoading("Logging in...");
      let password = this.password.value;
      this.api.userLogin(this.organization, this.email, password).then((token:Token) => {
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
              this.storage.setOrganization(organization),
              this.storage.setUser(person)
            ];
            if (this.mobile) {
              saves.push(this.database.saveOrganization(organization));
              saves.push(this.database.savePerson(organization, person));
            }
            Promise.all(saves).then(saved => {
              this.trackLogin(organization, person);
              this.events.publish('user:login');
              loading.dismiss();
              if (person.name && person.name.length > 0) {
                this.showToast(`Hello ${person.name}, welcome to ${organization.name}`);
              }
              else {
                this.showToast(`Welcome to ${organization.name}`);
              }
              if (person.config_profile_reviewed && person.config_self_test_sent) {
                this.showRootPage(CheckinListPage, {
                  organization: organization
                });
              }
              else {
                this.showRootPage(OnboardListPage, {
                  organization: organization,
                  person: person
                });
              }
            },
            (error:any) => {
              this.logger.error(this, "showNext", error);
              if (person.config_profile_reviewed && person.config_self_test_sent) {
                this.showRootPage(CheckinListPage, {
                  organization: organization
                });
              }
              else {
                this.showRootPage(OnboardListPage, {
                  organization: organization,
                  person: person
                });
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
    let title = "Check Your Inbox";
    let message = `If your email address ${this.email} has been registered with ${this.organization.name}, then you will receive instructions for resetting your password.`;
    let loading = this.showLoading("Resetting...");
    this.api.resetPassword(this.organization.subdomain, this.email).then((reset:any) => {
      this.logger.info(this, "resetPassword", reset);
      loading.dismiss();
      this.showAlert(title, message);
    },
    (error:any) => {
      this.logger.error(this, "resetPassword", error);
      loading.dismiss();
      this.showAlert(title, message);
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
