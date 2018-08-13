import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePublicPage } from '../../pages/base-public-page/base-public-page';
import { OnboardListPage } from '../../pages/onboard-list/onboard-list';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';
import { Token } from '../../models/token';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';
import { FirebaseProvider } from '../../providers/firebase/firebase';

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
  entryComponents:[ OnboardListPage ]
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
      protected firebase:FirebaseProvider) {
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
        .then((organization:Organization) => { this.organization = organization; return this.api.userLogin(organization, organization.email, this.password.value); })
        .then((token:Token) => { this.token = token; return this.api.getPerson(this.organization, "me"); })
        .then((person:Person) => { this.person = person; return this.api.getOrganization(this.organization); })
        .then((organization:Organization) => { this.organization = organization; return this.saveChanges(this.organization, this.person); })
        .then(() => { return this.updateFirebase(this.organization, this.person); })
        .then(() => {
          this.analytics.trackLogin(this.organization, this.person);
          this.intercom.trackLogin(this.organization, this.person);
          this.events.publish(EVENT_USER_AUTHENTICATED);
          loading.dismiss();
          this.loading = false;
          if (this.person.name && this.person.name.length > 0) {
            this.showToast(`Hello ${this.person.name}, welcome to ${this.organization.name}`);
          }
          else {
            this.showToast(`Welcome to ${this.organization.name}`);
          }
          this.showRootPage(OnboardListPage, {
            organization: this.organization,
            user: this.person
          });
        })
        .catch((error:any) => {
          this.logger.error(this, "createOrganization", error);
          this.loading = false;
          loading.dismiss();
          this.showAlert("Problem Creating Organization", error);
        });
      }
  }

  private updateFirebase(organization:Organization, person:Person):Promise<string> {
    return new Promise((resolve, reject) => {
      this.firebase.getToken().then((token:string) => {
        this.logger.info(this, "updateFirebase", token);
        this.api.updateFirebase(organization, person, token).then((updated:boolean) => {
          this.logger.info(this, "updateFirebase", token, "Updated", updated);
          resolve(token);
        },
        (error:any) => {
          this.logger.error(this, "updateFirebase", "Failed", error);
          resolve(null);
        });
      },
      (error:string) => {
        resolve(null);
      });
    });
  }

  private saveChanges(organization:Organization, person:Person) {
    organization.user_id = person.id;
    organization.user_name = person.name;
    let saves = [
      this.storage.setOrganization(organization),
      this.storage.setUser(person),
      this.storage.saveOrganization(organization),
      this.storage.savePerson(organization, person)
    ];
    return Promise.all(saves);
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
