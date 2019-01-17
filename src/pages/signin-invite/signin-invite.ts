import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePublicPage } from '../../pages/base-public-page/base-public-page';
import { CheckinListPage } from '../../pages/checkin-list/checkin-list';

import { Token } from '../../models/token';
import { Organization } from '../../models/organization';
import { Subscription } from '../../models/subscription';
import { User } from '../../models/user';
import { Person } from '../../models/person';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

import { EVENT_USER_AUTHENTICATED } from '../../constants/events';

@IonicPage({
  name: 'SigninInvitePage',
  segment: 'signin/invite/:subdomain/:person_id/:email/:token',
  defaultHistory: ['SigninUrlPage']
})
@Component({
  selector: 'page-signin-invite',
  templateUrl: 'signin-invite.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ CheckinListPage ]
})
export class SigninInvitePage extends BasePublicPage {

  @ViewChild('password')
  password:TextInput;

  @ViewChild('confirm')
  confirm:TextInput;

  logo:string = "assets/images/logo-dots.png";
  organization:Organization = null;
  user:User = null;
  email:string = null;
  token:string = null;

  loading:boolean = false;
  accepted:boolean = false;
  termsOfService:string = "https://www.tenfour.org/terms-of-service";
  privacyPolicy:string = "https://www.tenfour.org/privacy-policy";

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
      protected api:ApiProvider,
      protected storage:StorageProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();

    if (!this.modal) {
      this.loading=true;
      this.showModal(SigninInvitePage, {
        token: this.getParameter('token'),
        person_id: this.getParameter('person_id'),
        subdomain: this.getParameter('subdomain'),
        email: this.getParameter('email')
      }, {enableBackdropDismiss: false});
    }

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
    this.loading = true;
    return Promise.resolve()
      .then(() => { return this.loadOrganization(); })
      .then(() => { return this.loadUser(); })
      .then(() => { return this.loadEmail(); })
      .then(() => { return this.loadToken(); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Loaded");
        if (event) {
          event.complete();
        }
        this.loading = false;
      })
      .catch((error) => {
        this.logger.error(this, "loadUpdates", "Failed", error);
        if (event) {
          event.complete();
        }
        this.loading = false;
        let alert = this.showAlert("Problem Accepting Invitation", "Please try clicking the link in your invitation email again.");
        alert.onDidDismiss((dismiss:any) => {
          this.closePage();
        });
      });
  }

  private loadOrganization():Promise<Organization> {
    return new Promise((resolve, reject) => {
      if (this.hasParameter("subdomain")){
        let subdomain = this.getParameter<string>("subdomain");
        this.api.getOrganizations(subdomain).then((organizations:Organization[]) => {
          if (organizations && organizations.length > 0) {
            this.organization = organizations[0];
            resolve(this.organization);
          }
          else {
            this.organization = null;
            reject("Organization not found");
          }
        },
        (error:any) => {
          reject("Organization not found");
        });
      }
      else {
        reject("Organization not provided");
      }
    });
  }

  private loadUser():Promise<User> {
    return new Promise((resolve, reject) => {
      if (this.hasParameter("person_id")) {
        let id = this.getParameter<number>("person_id");
        this.user = new User({id: id});
        resolve(this.user);
      }
      else {
        this.user = null;
        reject("User not provided");
      }
    })
  }

  private loadEmail():Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.hasParameter("email")) {
        this.email = this.getParameter<string>("email");
        resolve(this.email);
      }
      else {
        this.email = null;
        reject("Email not provided");
      }
    })
  }

  private loadToken():Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.hasParameter("token")){
        this.token = this.getParameter<string>("token");
        resolve(this.token);
      }
      else {
        this.token = null;
        reject("Token not provided");
      }
    })
  }

  private acceptInitation(event:any) {
    this.logger.info(this, "acceptInitation");
    if (this.password.value === "") {
      this.showToast("Please enter a password");
      setTimeout(() => {
        this.password.setFocus();
      }, 500);
    }
    else if (this.password.value.length < 6) {
      this.showToast("Password is too short");
      setTimeout(() => {
        this.password.setFocus();
      }, 500);
    }
    else if (this.password.value !== this.confirm.value) {
      this.showToast("Password and confirm do not match");
      setTimeout(() => {
        this.confirm.setFocus();
      }, 500);
    }
    else if (this.accepted == false) {
      this.showAlert("Terms of Service", "You must accept the Terms of Service and Privacy Policy before you can continue.");
    }
    else {
      this.loading = true;
      let loading = this.showLoading("Signing in...", true);
      Promise.resolve()
        .then(() => { return this.api.acceptInvite(this.organization, this.user, this.password.value, this.token); })
        .then((person:Person) => { return this.api.userLogin(this.organization, this.email, this.password.value); })
        .then((token:Token) => { return this.api.getPerson(this.organization, "me"); })
        .then((person:Person) => { return this.storage.setUser(person); })
        .then((stored:boolean) => { return this.api.getOrganization(this.organization); })
        .then((organization:Organization) => { return this.storage.setOrganization(organization); })
        .then((stored:boolean) => {
          this.logger.info(this, "acceptInitation", "Accepted");
          this.events.publish(EVENT_USER_AUTHENTICATED);
          loading.dismiss();
          this.loading = false;
          if (this.user.name && this.user.name.length > 0) {
            this.showToast(`Hello ${this.user.name}, welcome to ${this.organization.name}`);
          }
          else {
            this.showToast(`Welcome to ${this.organization.name}`);
          }
          this.hideModal();
          this.showRootPage(CheckinListPage, {});
        })
        .catch((error) => {
          this.logger.error(this, "acceptInitation", error);
          loading.dismiss();
          this.loading = false;
          this.showAlert("Problem Accepting Invitation", error);
        });
    }
  }

  private acceptInitationOnReturn(event:any) {
    if (this.isKeyReturn(event)) {
      if (this.password.value.length == 0) {
        this.password.setFocus();
      }
      else if (this.confirm.value.length == 0) {
        this.confirm.setFocus();
      }
      else if (this.accepted == false) {
        this.hideKeyboard();
      }
      else {
        this.hideKeyboard();
        this.acceptInitation(event);
      }
      return false;
    }
    return true;
  }

  private closeModal(event:any=null) {
    this.hideModal();
  }

}
