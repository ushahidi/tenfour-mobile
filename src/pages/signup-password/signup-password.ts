import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { OnboardListPage } from '../../pages/onboard-list/onboard-list';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Token } from '../../models/token';

@IonicPage()
@Component({
  selector: 'page-signup-password',
  templateUrl: 'signup-password.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[ OnboardListPage ]
})
export class SignupPasswordPage extends BasePage {

  @ViewChild('password')
  password:TextInput;

  @ViewChild('confirm')
  confirm:TextInput;

  organization:Organization;

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
  }

  createOrganization(event) {
    this.logger.info(this, "createOrganization");
    if (this.password.value.length < 6) {
      this.showToast("Password is too short");
    }
    else if (this.password.value != this.confirm.value) {
      this.showToast("Password and conform do not match");
    }
    else {
      let loading = this.showLoading("Creating...");
      this.organization.password = this.password.value;
      this.api.createOrganization(this.organization).then(
        (organization:Organization) => {
          this.logger.info(this, "createOrganization", "Organization", organization);
          this.api.userLogin(organization, organization.email, this.password.value).then((token:Token) => {
            this.logger.info(this, "createOrganization", "Token", token);
            this.api.getPerson(organization, "me").then((person:Person) => {
              this.logger.info(this, "userLogin", "Person", person);
              organization.user_id = person.id;
              let saves = [
                this.database.saveOrganization(organization),
                this.database.savePerson(organization, person)];
              Promise.all(saves).then(saved => {
                loading.dismiss();
                this.showToast(`Logged in to ${organization.name}`);
                this.showRootPage(OnboardListPage,
                  { organization: organization,
                    person: person });
              });
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

  createOrganizationOnReturn(event) {
    if (event.keyCode == 13) {
      this.hideKeyboard();
      this.createOrganization(event);
      return false;
    }
    return true;
  }

}
