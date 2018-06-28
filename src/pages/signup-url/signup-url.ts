import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput,
         Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePublicPage } from '../../pages/base-public-page/base-public-page';
import { SignupPasswordPage } from '../../pages/signup-password/signup-password';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'SignupUrlPage',
  segment: 'signup/url',
  defaultHistory: ['SigninUrlPage', 'SignupEmailPage', 'SignupOwnerPage', 'SignupNamePage']
})
@Component({
  selector: 'page-signup-url',
  templateUrl: 'signup-url.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ SignupPasswordPage ]
})
export class SignupUrlPage extends BasePublicPage {

  @ViewChild('subdomain')
  subdomain:TextInput;

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

  private showNext(event:any) {
    this.logger.info(this, "showNext");
    let loading = this.showLoading("Checking...", true);
    this.api.getOrganizations(this.subdomain.value).then((organizations:Organization[]) => {
      this.logger.error(this, "showNext", organizations);
      loading.dismiss();
      if (organizations && organizations.length > 0) {
        this.showAlert("Organization URL Exists", "Sorry, the organization already exists. Please choose another subdomain.");
      }
      else {
        this.organization.subdomain = this.subdomain.value;
        this.storage.setOrganization(this.organization).then((stored:boolean) => {
          this.showPage(SignupPasswordPage, {
            organization: this.organization
          });
        });
      }
    },
    (error:any) => {
      this.logger.info(this, "showNext", error);
      loading.dismiss();
      this.showAlert("Organization URL", error);
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
