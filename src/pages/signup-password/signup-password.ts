import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePublicPage } from '../../pages/base-public-page/base-public-page';
import { CheckinListPage } from '../../pages/checkin-list/checkin-list';
import { SigninTokenPage } from '../../pages/signin-token/signin-token';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';
import { Token } from '../../models/token';
import { Subscription } from '../../models/subscription';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { EnvironmentProvider } from '../../providers/environment/environment';

import { EVENT_USER_AUTHENTICATED } from '../../constants/events';

@IonicPage({
  name: 'SignupPasswordPage',
  segment: 'signup/password',
  defaultHistory: ['SignupEmailPage']
})
@Component({
  selector: 'page-signup-password',
  templateUrl: 'signup-password.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ CheckinListPage ]
})
export class SignupPasswordPage extends BasePublicPage {

  @ViewChild('password')
  password:TextInput;

  @ViewChild('confirm')
  confirm:TextInput;

  organization:Organization;
  person:Person;
  token:Token;

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
      protected storage:StorageProvider,
      protected firebase:FirebaseProvider,
      protected environment:EnvironmentProvider) {
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
        this.showToast(error);
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
          resolve(null);
        });
      }
    });
  }

  private createOrganization(event:any) {
    this.logger.info(this, "createOrganization");
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
      let loading = this.showLoading("Signing up...", true);
      Promise.resolve()
        .then(() => { return this.storage.getVerificationCode(); })
        .then((verificationCode:string) => { return this.api.createOrganization(this.organization, this.password.value, verificationCode); })
        .then((organization:Organization) => { this.organization = organization; return this.api.userLogin(this.organization, this.organization.email, this.password.value); })
        .then((token:Token) => {
          if (!this.loginToOrganizationSubdomain(this.organization, token)) {
            this.loading = false;
            loading.dismiss();
            this.hideModal();
            this.showRootPage(SigninTokenPage, {
              organization: this.organization,
              token: JSON.stringify(token)
            })
          }
        })
        .catch((error:any) => {
          this.logger.error(this, "createOrganization", error);
          this.loading = false;
          loading.dismiss();
          this.showAlert("Problem Creating Organization", error);
        });
      }
  }

  private loginToOrganizationSubdomain(organization:Organization, token:Token):boolean {
    if (this.website) {
      let appDomain = this.environment.getAppDomain();
      let extension = '.' + appDomain.replace('app.', '');
      let locationSubdomain = location.hostname.replace(extension, '');
      let subdomain = this.organization.subdomain.toLowerCase();
      if (subdomain !== locationSubdomain && 'localhost' !== locationSubdomain) {
        location.assign(location.protocol
          + "//"
          + subdomain
          + extension
          + (location.port != '80' && location.port != '443' ? ':' + location.port : '')
          + "/#/signin/token/"
          + encodeURIComponent(JSON.stringify(token)));
        return true;
      }
    }
    return false;
  }

  private createOrganizationOnReturn(event:any) {
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
        this.createOrganization(event);
      }
      return false;
    }
    return true;
  }

  private closeModal(event:any=null) {
    this.hideModal();
  }

}
