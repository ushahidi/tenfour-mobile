import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Events, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { OnboardListPage } from '../../pages/onboard-list/onboard-list';

import { Token } from '../../models/token';
import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'SigninInvitePage',
  segment: 'signin/invite/:email/:subdomain/:token',
  defaultHistory: ['SigninUrlPage']
})
@Component({
  selector: 'page-signin-invite',
  templateUrl: 'signin-invite.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ OnboardListPage ]
})
export class SigninInvitePage extends BasePage {

  @ViewChild('password')
  password:TextInput;

  @ViewChild('confirm')
  confirm:TextInput;

  organization:Organization;
  person:Person;
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
      protected events:Events,
      protected api:ApiProvider,
      protected storage:StorageProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    let loading = this.showLoading("Loading...");
    this.loadUpdates(true).then((loaded:any) => {
      loading.dismiss();
    },
    (error:any) => {
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
      .then(() => { return this.loadEmail(); })
      .then(() => { return this.loadToken(); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Loaded");
        this.loading = false;
        if (event) {
          event.complete();
        }
      })
      .catch((error) => {
        this.logger.error(this, "loadUpdates", "Failed", error);
        this.loading = false;
        if (event) {
          event.complete();
        }
        this.closePage();
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
        });
      }
      else {
        reject("Organization not provided");
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
        this.email = null;
        reject(null);
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
        reject(null);
      }
    })
  }

  private acceptInitation(event:any) {
    this.logger.info(this, "acceptInitation");
    if (this.password.value.length < 6) {
      this.showToast("Password is too short");
    }
    else if (this.password.value != this.confirm.value) {
      this.showToast("Password and confirm do not match");
    }
    else if (this.accepted == false) {
      this.showAlert("Terms of Service", "You must accept the Terms of Service before you can continue.");
    }
    else {
      this.loading = true;
      let loading = this.showLoading("Accepting...", true);
      this.api.acceptInvite(this.organization, this.person, this.password.value, this.token).then((person:Person) => {
        this.api.userLogin(this.organization, this.email, this.password.value).then((token:Token) => {
          this.storage.savePerson(this.organization, person).then((saved:boolean) => {
            this.showRootPage(OnboardListPage, {
              organization: this.organization,
              person: person
            });
          },
          (error:any) => {
            this.showRootPage(OnboardListPage, {
              organization: this.organization,
              person: person
            })
          });
        },
        (error:any) => {
          this.logger.error(this, "acceptInitation", error);
          loading.dismiss();
          this.loading = false;
          this.showAlert("Problem Logging In", error);
        });
      },
      (error:any) => {
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

}
