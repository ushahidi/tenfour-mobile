import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Events, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { OnboardListPage } from '../../pages/onboard-list/onboard-list';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Token } from '../../models/token';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

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
export class SignupPasswordPage extends BasePage {

  @ViewChild('password')
  password:TextInput;

  @ViewChild('confirm')
  confirm:TextInput;

  organization:Organization;

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
      this.showToast(error);
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
      this.organization.password = this.password.value;
      this.api.createOrganization(this.organization).then((organization:Organization) => {
        this.logger.info(this, "createOrganization", "Organization", organization);
        this.api.userLogin(organization, organization.email, this.password.value).then((token:Token) => {
          this.logger.info(this, "createOrganization", "Token", token);
          this.api.getPerson(organization, "me").then((person:Person) => {
            this.logger.info(this, "createOrganization", "Person", person);
            this.api.getOrganization(organization).then((organization:Organization) => {
              this.logger.info(this, "createOrganization", "Organization", organization);
              organization.user_id = person.id;
              organization.user_name = person.name;
              organization.password = this.password.value;
              let saves = [
                this.storage.setOrganization(organization),
                this.storage.setUser(person),
                this.storage.saveOrganization(organization),
                this.storage.savePerson(organization, person)
              ];
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
                this.showRootPage(OnboardListPage, {
                  organization: organization,
                  person: person
                });
              });
            },
            (error:any) => {
              this.logger.error(this, "createOrganization", error);
              loading.dismiss();
              this.loading = false;
              this.showAlert("Problem Creating Organization", error);
            });
          },
          (error:any) => {
            this.logger.error(this, "createOrganization", error);
            loading.dismiss();
            this.loading = false;
            this.showAlert("Problem Creating Account", error);
          });
        },
        (error:any) => {
          this.logger.error(this, "createOrganization", error);
          loading.dismiss();
          this.loading = false;
          this.showAlert("Problem Logging In", error);
        });
      },
      (error:any) => {
        this.logger.error(this, "createOrganization", error);
        loading.dismiss();
        this.loading = false;
        this.showAlert("Problem Creating Organization", error);
      });
    }
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

}
