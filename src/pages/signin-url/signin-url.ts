import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePublicPage } from '../../pages/base-public-page/base-public-page';
import { SignupEmailPage } from '../../pages/signup-email/signup-email';
import { SigninLookupPage } from '../../pages/signin-lookup/signin-lookup';
import { SigninTokenPage } from '../../pages/signin-token/signin-token';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Token } from '../../models/token';

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
  entryComponents:[ SignupEmailPage ]
})
export class SigninUrlPage extends BasePublicPage {

  @ViewChild('subdomain')
  subdomain:TextInput;
  @ViewChild('email')
  email:TextInput;
  @ViewChild('password')
  password:TextInput;
  title:string = null;
  organization:Organization = null;
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

    if (this.navParams.get('token')) {
      this.logger.info(this, 'token', this.navParams.get('token'));
    }

    let organizationSubdomain = this.parseOrganizationSubdomain();
    if (organizationSubdomain && organizationSubdomain.length > 0) {
      this.subdomain.value = organizationSubdomain;
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
      return;
    }
    if (this.email.value.length == 0) {
      this.showToast("Please enter your email");
      setTimeout(() => {
        this.email.setFocus();
      }, 500);
      return;
    }
    if (this.password.value.length == 0) {
      this.showToast("Please enter your password");
      setTimeout(() => {
        this.password.setFocus();
      }, 500);
      return;
    }

    this.loading = true;
    let loading = this.showLoading("Logging in...", true);

    Promise.resolve()
      .then(() => { return this.loadOrganization(); })
      .then(() => { return this.api.userLogin(this.organization, this.email.value, this.password.value); })
      .then((token:Token) => {
        this.logger.info(this, "showNext", token);

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
        this.logger.error(this, "showNext", error);
        this.loading = false;
        loading.dismiss();
        if (error === 'invalid_credentials') {
          error = "Invalid email and/or password. Please try again.";
        }
        this.showAlert("Login Unsuccessful", error);
      });
  }

  private loadOrganization():Promise<Organization> {
    this.logger.info(this, "loadOrganization");
    return new Promise((resolve, reject) => {
      let subdomain = this.subdomain.value.toLowerCase();
      this.api.getOrganizations(subdomain).then((organizations:Organization[]) => {
        this.logger.info(this, "loadOrganization", organizations);
        if (organizations && organizations.length > 0) {
          this.organization = organizations[0];
          resolve(this.organization);
        }
        else {
          reject('Sorry, that organization does\'t exist.');
        }
      }, (error:any) => {
        this.logger.error(this, "loadOrganization", error);
        reject();
      });
    });
  }

  private loginToOrganizationSubdomain(organization:Organization, token:Token):boolean {
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
          + "/#/signin/token/"
          + encodeURIComponent(JSON.stringify(token)));
        return true;
      }
    }
    return false;
  }

  private createOrganization(event:any) {
    this.logger.info(this, "createOrganization");
    this.showModal(SignupEmailPage, {}, {
      enableBackdropDismiss: false
    });
  }

  private lookupOrganization(event:any) {
    this.logger.info(this, "lookupOrganization");
    this.showModal(SigninLookupPage, {});
  }

  private resetPassword(event:any) {
    this.logger.info(this, "resetPassword");
    if (this.subdomain.value.length == 0) {
      this.showToast("Please enter your domain");
      setTimeout(() => {
        this.subdomain.setFocus();
      }, 500);
      return;
    }
    if (this.email.value.length == 0) {
      this.showToast("Please enter your email");
      setTimeout(() => {
        this.email.setFocus();
      }, 500);
      return;
    }
    let loading = this.showLoading("Resetting...", true);
    this.loadOrganization().then((organization:Organization) => {
      let title = "Check Your Inbox";
      let message = `If your email address ${this.email.value} has been registered with ${this.organization.name}, then you will receive instructions for resetting your password.`;
      this.api.resetPassword(this.organization.subdomain, this.email.value).then((reset:any) => {
        this.logger.info(this, "resetPassword", reset);
        loading.dismiss();
        this.showAlert(title, message);
      },
      (error:any) => {
        this.logger.error(this, "resetPassword", error);
        loading.dismiss();
        this.showAlert(title, message);
      });
    }, (error) => {
      this.logger.error(this, "resetPassword", error);
      loading.dismiss();
      this.showAlert("Organization not found", "Sorry, organization \"" + this.subdomain.value + "\" does not exist.");
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

  private closeModal(event:any=null) {
    this.hideModal();
  }

  private findURL(event:any=null) {
    this.logger.info(this, "findURL");
  }

}
