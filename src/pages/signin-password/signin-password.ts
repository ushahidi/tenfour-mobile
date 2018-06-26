import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Events, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePublicPage } from '../../pages/base-public-page/base-public-page';
import { CheckinListPage } from '../../pages/checkin-list/checkin-list';
import { OnboardListPage } from '../../pages/onboard-list/onboard-list';

import { Token } from '../../models/token';
import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'SigninPasswordPage',
  segment: 'signin/password',
  defaultHistory: ['SigninUrlPage', 'SigninEmailPage']
})
@Component({
  selector: 'page-signin-password',
  templateUrl: 'signin-password.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ CheckinListPage, OnboardListPage ]
})
export class SigninPasswordPage extends BasePublicPage {

  @ViewChild('password')
  password:TextInput;

  organization:Organization = null;
  email:string = null;
  logo:string = "assets/images/dots.png";
  loading:boolean = false;

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
      protected storage:StorageProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    let loading = this.showLoading("Loading...");
    this.loadUpdates(true).then((loaded:any) => {
      loading.dismiss();
    });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.analytics.trackPage(this);
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    return Promise.resolve()
      .then(() => { return this.loadOrganization(cache); })
      .then(() => { return this.loadEmail(); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Loaded");
        if (event) {
          event.complete();
        }
      })
      .catch((error) => {
        this.logger.error(this, "loadUpdates", "Failed", error);
        if (event) {
          event.complete();
        }
        this.closePage();
      });
  }

  private loadOrganization(cache:boolean=true):Promise<Organization> {
    return new Promise((resolve, reject) => {
      if (cache && this.organization) {
        resolve(this.organization);
      }
      else if (this.hasParameter("organization")){
        this.organization = this.getParameter<Organization>("organization");
        resolve(this.organization);
      }
      else {
        this.storage.getOrganization().then((organization:Organization) => {
          this.organization = organization;
          resolve(this.organization);
        },
        (error:any) => {
          this.organization = null;
          reject("No organization provided");
        });
      }
    });
  }

  private loadEmail():Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.hasParameter("email")) {
        this.email = this.getParameter<string>("email");
        resolve(this.email);
      }
      else {
        reject("No email provided");
      }
    })
  }

  private showNext(event:any) {
    this.logger.info(this, "showNext");
    this.loading = true;
    if (this.password.value && this.password.value.length > 0) {
      let loading = this.showLoading("Logging in...", true);
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
              saves.push(this.storage.saveOrganization(organization));
              saves.push(this.storage.savePerson(organization, person));
            }
            Promise.all(saves).then(saved => {
              this.analytics.trackLogin(organization, person);
              this.events.publish('user:login');
              loading.dismiss();
              this.loading = false;
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
              this.loading = false;
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
        this.loading = false;
        loading.dismiss();
        this.showAlert("Login Unsuccessful", "Invalid email and/or password, please try again.");
      });
    }
  }

  private resetPassword(event:any) {
    let title = "Check Your Inbox";
    let message = `If your email address ${this.email} has been registered with ${this.organization.name}, then you will receive instructions for resetting your password.`;
    let loading = this.showLoading("Resetting...", true);
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
    if (this.isKeyReturn(event)) {
      this.hideKeyboard();
      this.showNext(event);
      return false;
    }
    return true;
  }

}
