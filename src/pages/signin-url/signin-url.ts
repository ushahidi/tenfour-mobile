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

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.analytics.trackPage(this);

    let organizationSubdomain = this.parseOrganizationSubdomain();

    if (organizationSubdomain) {
      this.subdomain.value = organizationSubdomain;
      this.showNext(undefined);
    }
  }

  private parseOrganizationSubdomain() {
    let hostname = location.hostname;
    let appDomain = this.environment.getAppDomain();

    if (appDomain && appDomain !== hostname) {
      let subdomain = hostname.replace('.' + appDomain, '');

      if (subdomain !== 'app') {
        this.logger.info(this, 'Subdomain', subdomain);
        return subdomain;
      }
    }

    return null;
  }

  private showNext(event:any) {
    this.logger.info(this, "showNext", this.subdomain.value);
    if (this.subdomain.value && this.subdomain.value.length > 0) {
      let subdomain = this.subdomain.value.toLowerCase();
      let loading = this.showLoading("Searching...", true);
      this.api.getOrganizations(subdomain).then((organizations:Organization[]) => {
        this.logger.info(this, "showNext", organizations);
        loading.dismiss();
        if (organizations && organizations.length > 0) {
          let organization:Organization = organizations[0];

          if (!this.redirectToOrganizationSubdomain(organization)) {
            this.storage.setOrganization(organization).then((stored:boolean) => {
              this.showPage(SigninEmailPage, {
                organization: organization
              });
            });
          }
        }
        else {
          // changing this behaviour to have parity with existing client
          // this.showPage(SignupEmailPage, {});
          this.showAlert("Organization not found", `Sorry, that organization doesn't exist.`);
        }
      },
      (error:any) => {
        this.logger.error(this, "showNext", error);
        loading.dismiss();
        this.showAlert("Problem Finding Organization", error);
      });
    }
  }

  private redirectToOrganizationSubdomain(organization:Organization) {
    let appDomain = this.environment.getAppDomain();
    let extension = '.' + appDomain;
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

    return false;
  }

  private createOrganization(event:any) {
    this.logger.info(this, "createOrganization");
    this.showPage(SignupEmailPage, {});
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
