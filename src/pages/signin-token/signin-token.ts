import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, App, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePublicPage } from '../../pages/base-public-page/base-public-page';
import { CheckinListPage } from '../../pages/checkin-list/checkin-list';
import { SigninUrlPage } from '../../pages/signin-url/signin-url';

import { Token } from '../../models/token';
import { Organization } from '../../models/organization';
import { Subscription } from '../../models/subscription';
import { User } from '../../models/user';
import { Person } from '../../models/person';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { EnvironmentProvider } from '../../providers/environment/environment';

import { EVENT_USER_AUTHENTICATED } from '../../constants/events';

@IonicPage({
  name: 'SigninTokenPage',
  segment: 'signin/token',
  defaultHistory: ['SigninUrlPage']
})
@Component({
  selector: 'page-signin-token',
  templateUrl: 'signin-token.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[  ]
})
export class SigninTokenPage extends BasePublicPage {

  organization:Organization = null;
  person:Person = null;
  token:Token = null;
  logo:string = "assets/images/logo-dots.png";
  loading:boolean = true;

  constructor(
      protected app:App,
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
      protected environment:EnvironmentProvider,
      protected firebase:FirebaseProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    let loading = this.showLoading("Logging in...");

    try {
      this.token = this.navParams.get('token') ? <Token>JSON.parse(this.navParams.get('token')) : null;
    } catch (e) {
      this.logger.error(this, e);
    }

    if (!this.token) {
      loading.dismiss();
      return this.showRootPage(SigninUrlPage, {});
    }

    Promise.resolve()
      .then(() => this.loadUpdates())
      .then(() => this.userLogout())
      .then(() => this.authWithToken())
      .then(() => {
        if (this.person.name && this.person.name.length > 0) {
          this.showToast(`Hello ${this.person.name}, welcome to ${this.organization.name}`);
        }
        else {
          this.showToast(`Welcome to ${this.organization.name}`);
        }

        this.hideModals().then(() => {
          this.showRootPage(CheckinListPage, {
            organization: this.organization,
            user: this.person
          },{
            animate: true,
            direction: 'forward' }).then(() => {
            loading.dismiss();
            this.events.publish(EVENT_USER_AUTHENTICATED);
          });
        });
      })
      .catch((error:any) => {
        this.logger.error(this, error);
        loading.dismiss();
        this.showRootPage(SigninUrlPage, {});
      });
  }

  private userLogout(event:any=null) {
    this.logger.info(this, "userLogout");
    let removes = [
      this.api.removeToken(this.organization),
      this.storage.removeFirebase(),
      this.storage.removeOrganization(),
      this.storage.removeUser(),
      this.storage.removeOrganizations(),
      this.storage.removeSubscriptions(),
      this.storage.removeNotifications(),
      this.storage.removeCheckins(),
      this.storage.removeAnswers(),
      this.storage.removeReplies(),
      this.storage.removeRecipients(),
      this.storage.removeGroups(),
      this.storage.removeEmails(),
      this.storage.removePeople(),
      this.storage.removeContacts(),
    ];
    return Promise.all(removes);
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.analytics.trackPage(this);
  }

  ionViewCanEnter():Promise<boolean> {
    return Promise.resolve(true);
  }

  private parseOrganizationSubdomain() {
    if (this.website) {
      let hostname = location.hostname;
      let appDomain = this.environment.getAppDomain().replace('app.', '');
      if (appDomain && appDomain !== hostname && 'localhost' !== hostname) {
        let subdomain = hostname.replace('.' + appDomain, '');
        if (subdomain !== 'app') {
          this.logger.info(this, 'Subdomain', subdomain);
          return subdomain.toLowerCase();
        }
      }
    }
    return null;
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");

    return Promise.resolve()
      .then(() => { return this.loadOrganization(); })
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
        this.closePage();
      });
  }

  private loadOrganization():Promise<Organization> {
    this.logger.info(this, "loadOrganization");
    return new Promise((resolve, reject) => {

      if (this.hasParameter("organization")) {
        this.organization = this.getParameter<Organization>("organization");
        resolve(this.organization);
      } else {
        let organizationSubdomain = this.parseOrganizationSubdomain();

        if (!organizationSubdomain) {
          reject();
        }

        this.api.getOrganizations(organizationSubdomain).then((organizations:Organization[]) => {
          this.logger.info(this, "loadOrganization", organizations);
          if (organizations && organizations.length > 0) {
            this.organization = organizations[0];
            resolve(this.organization);
          }
          else {
            reject('Organization not found.');
          }
        }, (error:any) => {
          this.logger.error(this, "loadOrganization", error);
          reject();
        });
      }
    });
  }

  private authWithToken():Promise<any> {
    this.logger.info(this, "authWithToken");

    return new Promise((resolve, reject) => {
        this.api.saveToken(this.organization, this.token)
        .then(() => { return this.api.getPerson(this.organization, "me"); })
        .then((person:Person) => { this.person = person; return this.api.getOrganization(this.organization); })
        .then((organization:Organization) => { this.organization = organization; return this.loadSubscriptions(this.organization, this.person); })
        .then((subscriptions:Subscription[]) => { return this.saveChanges(this.organization, this.person, subscriptions); })
        .then((saved:boolean) => {
          this.logger.info(this, "authWithToken", saved);
          this.updateFirebase(this.organization, this.person);
          this.analytics.trackLogin(this.organization, this.person);
          this.intercom.trackLogin(this.organization, this.person);
          resolve();
        })
        .catch(reject);
    });
  }

  private loadSubscriptions(organization:Organization, person:Person):Promise<Subscription[]> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadSubscriptions");
      if (person && person.isOwner()) {
        this.api.getSubscriptions(organization).then((subscriptions:Subscription[]) => {
          this.logger.info(this, "loadSubscriptions", "Loaded", subscriptions);
          resolve(subscriptions);
        },
        (error:any) => {
          this.logger.error(this, "loadSubscriptions", "Failed", error);
          reject(error);
        });
      }
      else {
        this.logger.info(this, "loadSubscriptions", "Not Owner");
        resolve([]);
      }
    });
  }

  private updateFirebase(organization:Organization, person:Person):Promise<string> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "updateFirebase");
      this.firebase.getToken().then((token:string) => {
        if (token && token.length > 0) {
          this.logger.info(this, "updateFirebase", token);
          this.api.updateFirebase(organization, person, token).then((updated:boolean) => {
            this.logger.info(this, "updateFirebase", token, "Updated", updated);
            resolve(token);
          },
          (error:any) => {
            this.logger.error(this, "updateFirebase", token, "Failed", error);
            resolve(null);
          });
        }
        else {
          this.logger.warn(this, "updateFirebase", "NULL");
          resolve(null);
        }
      },
      (error:string) => {
        resolve(null);
      });
    });
  }

  private saveChanges(organization:Organization, person:Person, subscriptions:Subscription[]):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "saveChanges");
      let subscription = subscriptions && subscriptions.length > 0 ? subscriptions[0] : null;
      organization.user_id = person.id;
      organization.user_name = person.name;
      organization.email = person.hasEmails() ? person.getEmails()[0].contact : '';
      let saves = [
        this.storage.setUser(person),
        this.storage.setOrganization(organization),
        this.storage.setSubscription(subscription),
        this.storage.saveOrganization(organization),
        this.storage.savePerson(organization, person),
        this.storage.saveSubscription(organization, subscription)
      ];
      Promise.all(saves).then((saved:any) => {
        this.logger.info(this, "saveChanges", "Saved");
        resolve(true);
      },
      (error:any) => {
        this.logger.info(this, "saveChanges", "Failed", error);
        reject(error);
      });
    });
  }


}
