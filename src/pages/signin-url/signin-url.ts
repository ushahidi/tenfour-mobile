import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePublicPage } from '../../pages/base-public-page/base-public-page';
import { SigninEmailPage } from '../../pages/signin-email/signin-email';
import { SignupEmailPage } from '../../pages/signup-email/signup-email';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';
import { EnvironmentProvider } from '../../providers/environment/environment';

@IonicPage({
  name: 'SigninUrlPage',
  segment: 'signin'
})
@Component({
  selector: 'page-signin-url',
  templateUrl: 'signin-url.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ SigninEmailPage, SignupEmailPage ]
})
export class SigninUrlPage extends BasePublicPage {

  @ViewChild('subdomain')
  subdomain:TextInput;
  title:string = null;

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
      protected environment:EnvironmentProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    if (this.environment.isProduction() == false) {
      this.title = this.environment.getEnvironmentName().toUpperCase();
    }
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.analytics.trackPage(this);
    let organizationSubdomain = this.parseOrganizationSubdomain();
    if (organizationSubdomain && organizationSubdomain.length > 0) {
      this.subdomain.value = organizationSubdomain;
      this.showNext();
    }
  }

  private parseOrganizationSubdomain() {
    if (this.website) {
      let hostname = location.hostname;
      let appDomain = this.environment.getAppDomain().replace('app.', '');
      if (appDomain && appDomain !== hostname && 'localhost' !== hostname) {
        let subdomain = hostname.replace('.' + appDomain, '');
        if (subdomain !== 'app') {
          this.logger.info(this, 'Subdomain', subdomain);
          return subdomain;
        }
      }
    }
    return null;
  }

  private showNext(event:any=null) {
    this.logger.info(this, "showNext", this.subdomain.value);
    if (this.subdomain.value.length == 0) {
      this.showToast("Please enter your domain");
      setTimeout(() => {
        this.subdomain.setFocus();
      }, 500);
    }
    else {
      let subdomain = this.subdomain.value.toLowerCase();
      let loading = this.showLoading("Searching...", true);
      this.api.getOrganizations(subdomain).then((organizations:Organization[]) => {
        this.logger.info(this, "showNext", organizations);
        loading.dismiss();
        if (organizations && organizations.length > 0) {
          let organization:Organization = organizations[0];
          if (!this.redirectToOrganizationSubdomain(organization)) {
            this.storage.setOrganization(organization).then((stored:boolean) => {
              this.showModal(SigninEmailPage, {
                organization: organization
              });
            });
          }
        }
        else {
          this.showAlert("Organization not found", "Sorry, that organization doesn't exist.");
        }
      },
      (error:any) => {
        this.logger.error(this, "showNext", error);
        loading.dismiss();
        this.showAlert("Problem Finding Organization", error);
      });
    }
  }

  private redirectToOrganizationSubdomain(organization:Organization):boolean {
    if (this.website) {
      let appDomain = this.environment.getAppDomain();
      let extension = '.' + appDomain.replace('app.', '');
      let locationSubdomain = location.hostname.replace(extension, '');
      let subdomain = this.subdomain.value.toLowerCase();
      if (subdomain !== locationSubdomain && 'localhost' !== locationSubdomain) {
        location.assign(location.protocol
          + "//"
          + subdomain
          + extension
          + (location.port != '80' && location.port != '443' ? ':' + location.port : '')
          + "/");
        return true;
      }
    }
    return false;
  }

  private createOrganization(event:any) {
    this.logger.info(this, "createOrganization");
    this.showModal(SignupEmailPage, {});
  }

  private showNextOnReturn(event:any) {
    if (this.isKeyReturn(event)) {
      this.hideKeyboard();
      this.showNext(event);
      return false;
    }
    return true;
  }

  private closeModal(event:any=null) {
    this.hideModal();
  }

}
