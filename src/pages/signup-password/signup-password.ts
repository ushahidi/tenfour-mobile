import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Events, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { OnboardListPage } from '../../pages/onboard-list/onboard-list';

import { ApiProvider } from '../../providers/api/api';
import { DatabaseProvider } from '../../providers/database/database';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Token } from '../../models/token';

@IonicPage({
  name: 'SignupPasswordPage',
  segment: 'signup/password',
  defaultHistory: ['SignupEmailPage']
})
@Component({
  selector: 'page-signup-password',
  templateUrl: 'signup-password.html',
  providers: [ ApiProvider, DatabaseProvider ],
  entryComponents:[ OnboardListPage ]
})
export class SignupPasswordPage extends BasePage {

  @ViewChild('password')
  password:TextInput;

  @ViewChild('confirm')
  confirm:TextInput;

  organization:Organization;

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
      protected database:DatabaseProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.trackPage();
  }

  private createOrganization(event:any) {
    this.logger.info(this, "createOrganization");
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
      let loading = this.showLoading("Creating...");
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
                this.database.saveOrganization(organization),
                this.database.savePerson(organization, person)
              ];
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
                this.showRootPage(OnboardListPage, {
                  organization: organization,
                  person: person
                });
              });
            },
            (error:any) => {
              this.logger.error(this, "createOrganization", error);
              loading.dismiss();
              this.showAlert("Problem Creating Organization", error);
            });
          },
          (error:any) => {
            this.logger.error(this, "createOrganization", error);
            loading.dismiss();
            this.showAlert("Problem Creating Account", error);
          });
        },
        (error:any) => {
          this.logger.error(this, "createOrganization", error);
          loading.dismiss();
          this.showAlert("Problem Logging In", error);
        });
      },
      (error:any) => {
        this.logger.error(this, "createOrganization", error);
        loading.dismiss();
        this.showAlert("Problem Creating Organization", error);
      });
    }
  }

  private createOrganizationOnReturn(event:any) {
    if (event.keyCode == 13) {
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
