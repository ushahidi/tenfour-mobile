import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, App, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePublicPage } from '../../pages/base-public-page/base-public-page';
import { CheckinListPage } from '../../pages/checkin-list/checkin-list';

import { Token } from '../../models/token';
import { Organization } from '../../models/organization';
import { Subscription } from '../../models/subscription';
import { User } from '../../models/user';
import { Person } from '../../models/person';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';
import { FirebaseProvider } from '../../providers/firebase/firebase';

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

  @ViewChild('password')
  password:TextInput;

  organization:Organization = null;
  person:Person = null;
  token:Token = null;
  email:string = null;
  logo:string = "assets/images/logo-dots.png";
  loading:boolean = false;

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
        this.closePage();
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
          reject("No organization provided");
        });
      }
    });
  }

  private showNext(event:any) {
    this.logger.info(this, "showNext");

      this.loading = true;
      let loading = this.showLoading("Logging in...", true);
      let password = this.password.value;
      Promise.resolve()
        .then(() => { return this.api.userLogin(this.organization, this.email, password); })
        .then((token:Token) => { this.token = token; return this.api.getPerson(this.organization, "me"); })
        .then((person:Person) => { this.person = person; return this.api.getOrganization(this.organization); })
        .then((organization:Organization) => { this.organization = organization; return this.loadSubscriptions(this.organization, this.person); })
        .then((subscriptions:Subscription[]) => { return this.saveChanges(this.organization, this.person, subscriptions); })
        .then((saved:boolean) => {
          this.logger.info(this, "showNext", saved);
          this.updateFirebase(this.organization, this.person);
          this.analytics.trackLogin(this.organization, this.person);
          this.intercom.trackLogin(this.organization, this.person);
          this.loading = false;
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
          this.logger.error(this, "showNext", error);
          this.loading = false;
          loading.dismiss();
          this.showAlert("Login Unsuccessful", "Invalid email and/or password, please try again.");
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
      organization.email = this.email;
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
