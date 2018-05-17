import { Component, Injector, ViewChild, NgZone } from '@angular/core';
import { Platform, Events, Nav, SplitPane, NavController, ModalController, Modal, Loading, LoadingController, Toast, ToastController, Alert, AlertController, MenuController } from 'ionic-angular';

import { Badge } from '@ionic-native/badge';
import { Device } from '@ionic-native/device';
import { SegmentService } from 'ngx-segment-analytics';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Firebase } from '@ionic-native/firebase';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Deeplinks } from '@ionic-native/deeplinks';

import { SigninUrlPage } from '../pages/signin-url/signin-url';
import { SigninEmailPage } from '../pages/signin-email/signin-email';
import { SigninPasswordPage } from '../pages/signin-password/signin-password';

import { SignupCheckPage } from '../pages/signup-check/signup-check';
import { SignupPasswordPage } from '../pages/signup-password/signup-password';
import { SignupOwnerPage } from '../pages/signup-owner/signup-owner';

import { OnboardListPage } from '../pages/onboard-list/onboard-list';

import { CheckinListPage } from '../pages/checkin-list/checkin-list';
import { CheckinRespondPage } from '../pages/checkin-respond/checkin-respond';

import { GroupListPage } from '../pages/group-list/group-list';
import { PersonListPage } from '../pages/person-list/person-list';
import { PersonDetailsPage } from '../pages/person-details/person-details';
import { SettingsListPage } from '../pages/settings-list/settings-list';
import { NotificationListPage } from '../pages/notification-list/notification-list';

import { ApiProvider } from '../providers/api/api';
import { LoggerProvider } from '../providers/logger/logger';
import { DatabaseProvider } from '../providers/database/database';
import { InjectorProvider } from '../providers/injector/injector';
import { StorageProvider } from '../providers/storage/storage';

import { Model } from '../models/model';
import { Organization } from '../models/organization';
import { Email } from '../models/email';
import { Person } from '../models/person';
import { Contact } from '../models/contact';
import { Checkin } from '../models/checkin';
import { Answer } from '../models/answer';
import { Reply } from '../models/reply';
import { Recipient } from '../models/recipient';
import { Group } from '../models/group';
import { Notification } from '../models/notification';
import { Settings } from '../models/settings';
import { Country } from '../models/country';
import { Subscription } from '../models/subscription';

@Component({
  templateUrl: 'app.html'
})
export class TenFourApp {

  zone:NgZone = null;
  rootPage:any;
  organization:Organization = null;
  person:Person = null;
  tablet:boolean = false;
  mobile:boolean = false;
  phone:boolean = false;
  android:boolean = false;
  ios:boolean = false;
  browser:boolean = false;
  desktop:boolean = false;

  checkin:Checkin = null;

  @ViewChild(Nav)
  nav:Nav;

  @ViewChild('splitPane')
  splitPane:SplitPane;

  @ViewChild('rootNavController')
  navController:NavController;

  constructor(
    protected _zone:NgZone,
    protected platform:Platform,
    protected events:Events,
    protected injector:Injector,
    protected statusBar:StatusBar,
    protected splashScreen:SplashScreen,
    protected api:ApiProvider,
    protected storage:StorageProvider,
    protected database:DatabaseProvider,
    protected logger:LoggerProvider,
    protected modalController:ModalController,
    protected toastController:ToastController,
    protected loadingController:LoadingController,
    protected alertController:AlertController,
    protected menuController:MenuController,
    protected deeplinks:Deeplinks,
    protected segment:SegmentService,
    protected device:Device,
    protected badge:Badge,
    protected firebase:Firebase,
    protected screenOrientation:ScreenOrientation) {
    this.zone = _zone;
    InjectorProvider.injector = injector;
    this.platform.ready().then((ready) => {
      if (this.platform.is("cordova")) {
        Promise.resolve()
          .then(() => this.loadPlatforms())
          .then(() => this.loadStatusBar())
          .then(() => this.loadOrientation())
          .then(() => this.loadDeepLinks())
          .then(() => this.loadAnalytics())
          .then(() => this.loadEvents())
          .then(() => this.loadNotifications())
          .then(() => this.loadMobileApp([
                new Organization(),
                new Email(),
                new Group(),
                new Person(),
                new Contact(),
                new Checkin(),
                new Answer(),
                new Reply(),
                new Recipient(),
                new Settings(),
                new Country(),
                new Notification(),
                new Subscription()]));
      }
      else {
        Promise.resolve()
          .then(() => this.loadPlatforms())
          .then(() => this.loadAnalytics())
          .then(() => this.loadEvents())
          .then(() => this.loadNotifications())
          .then(() => this.loadWebApp());
      }
    });
  }

  private loadPlatforms():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadPlatforms");
      this.ios = this.platform.is('ios');
      this.android = this.platform.is('android');
      this.tablet = this.platform.is('tablet');
      this.mobile = this.platform.is('cordova');
      this.phone = this.platform.is('ios') || this.platform.is('android');
      this.browser = this.platform.is('core');
      this.desktop = this.platform.is('core');
      resolve(true);
    });
  }

  private loadOrientation():Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.mobile) {
        this.logger.info(this, "loadOrientation", this.screenOrientation.type);
        this.screenOrientation.unlock();
        this.screenOrientation.onChange().subscribe(() => {
          this.logger.info(this, "Orientation", this.screenOrientation.type);
        });
      }
      else {
        this.logger.info(this, "loadOrientation", "Ignored");
      }
      resolve(true);
    });
  }

  private loadStatusBar():Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.ios) {
        this.logger.info(this, "loadStatusBar", "iOS");
        this.statusBar.styleDefault();
        this.statusBar.overlaysWebView(false);
        this.statusBar.backgroundColorByHexString("#f5f5f1");
      }
      else if (this.android) {
        this.logger.info(this, "loadStatusBar", "Android");
        this.statusBar.styleLightContent();
        this.statusBar.overlaysWebView(false);
        this.statusBar.backgroundColorByHexString("#000000");
      }
      resolve(true);
    });
  }

  private loadAnalytics():Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.mobile) {
        this.logger.info(this, "loadAnalytics", "Loaded");
        this.segment.ready().then((ready:SegmentService) => {
          this.logger.info(this, "loadAnalytics", "Ready");
          this.segment.debug(this.device.isVirtual);
          resolve(true);
        });
      }
      else {
        this.logger.info(this, "loadAnalytics", "Ignored");
        resolve(true);
      }
    });
  }

  private loadDeepLinks():Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.mobile) {
        this.logger.info(this, "loadDeepLinks", "Loaded");
        this.deeplinks.routeWithNavController(this.navController, {}).subscribe(
          (match:any) => {
            let path = match['$link']['path'];
            let query = match['$link']['queryString'];
            let parameters = this.getParameters(query);
            this.logger.info(this, "loadDeepLinks", "Match", path, query, parameters);
            if (path === '/organization/email/confirmation/') {
              this.verifyEmail(parameters['email'], parameters['token']);
            }
            else if (path === '/login/email') {
               //SigninEmailPage
            }
            else if (path === '/login/password') {
               //SigninPasswordPage
            }
            else if (path === '/login/invite') {
               //SignupPasswordPage
            }
          },
          (nomatch:any) => {
            this.logger.info(this, "loadDeepLinks", "No Match", nomatch);
          });
      }
      else {
        this.logger.info(this, "loadDeepLinks", "Ignored");
      }
      resolve(true);
    });
  }

  private loadEvents():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadEvents");
      this.events.subscribe('account:deleted', () => {
        this.userLogout(false);
      });
      this.events.subscribe('user:login', () => {
        this.loadMenu();
      });
      this.events.subscribe('checkin:details', (data:any) => {
        this.showCheckinDetails(data.checkin);
      });
      resolve(true);
    })
  }

  private loadNotifications():Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.mobile) {
        this.logger.info(this, "loadNotifications", "Loaded");
        this.firebase.getToken().then((token:string) => {
          this.logger.info(this, "loadNotifications", "getToken", token);
        })
        .catch((error:any) => {
          this.logger.error(this, "loadNotifications", "getToken", error);
        });
        this.firebase.subscribe("test").then((data:any) => {
          this.logger.info(this, "loadNotifications", "subscribe", data);
        })
        .catch((error:any) => {
          this.logger.error(this, "loadNotifications", "subscribe", error);
        });
        this.firebase.onNotificationOpen().subscribe((data:any) => {
          this.logger.info(this, "loadNotifications", "onNotificationOpen", data);
        },
        (error:any) => {
          this.logger.info(this, "loadNotifications", "onNotificationOpen", error);
        })
      }
      else {
        this.logger.info(this, "loadNotifications", "Ignored");
      }
      resolve(true);
    });
  }

  private verifyEmail(email:string, token:string) {
    this.logger.info(this, "verifyEmail", "Email", email, "Token", token);
    if (email && email.length > 0 && token && token.length > 0) {
      let loading = this.showLoading("Verifying...");
      this.api.verifyEmail(email, token).then((_email:Email) => {
        this.logger.info(this, "verifyEmail", "Email", email, "Token", token, "Verified");
        loading.dismiss();
        this.showToast(`Email address ${email} verified`);
        let organization = new Organization({});
        organization.email = email;
        this.showSignupOwner(organization);
      },
      (error:any) => {
        this.logger.info(this, "verifyEmail", "Email", email, "Token", token, "Failed");
        loading.dismiss();
        this.showToast(`Unable to verify email ${email}`);
      });
    }
  }

  private loadWebApp() {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadWebApp");
      this.storage.getOrganization().then((organization:Organization) => {
        this.logger.info(this, "loadWebApp", "Organization", organization);
        this.organization = organization;
        this.storage.getPerson().then((person:Person) => {
          this.logger.info(this, "loadWebApp", "Person", person);
          if (person && person.config_profile_reviewed && person.config_self_test_sent) {
            this.person = person;
            this.logger.info(this, "loadWebApp", "Location", location.hash);
            if (location.hash == "#/checkins") {
              this.showCheckinList();
            }
            else if (location.hash === "#/groups") {
              this.showGroupList();
            }
            else if (location.hash === "#/people") {
              this.showPersonList();
            }
            else if (location.hash === "#/notifications") {
              this.showNotificationList();
            }
            else if (location.hash === "#/settings") {
              this.showSettingsList();
            }
            else {
              this.showCheckinList();
            }
            resolve(true);
          }
          else {
            this.showOnboardList(person);
            resolve(true);
          }
        },
        (error:any) => {
          this.logger.info(this, "loadWebApp", "Person", "None");
          this.showSigninUrl();
          resolve(false);
        });
      },
      (error:any) => {
        this.logger.info(this, "loadWebApp", "Organization", "None");
        this.showSigninUrl();
        resolve(false);
      });
    });
  }

  private loadMobileApp(models:Model[]):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadMobileApp");
      this.loadDatabase(models).then((loaded:any) => {
        this.logger.info(this, "loadMobileApp", "Database", loaded);
        this.storage.getOrganization().then((organization:Organization) => {
          if (organization) {
            this.organization = organization;
            this.logger.info(this, "loadMobileApp", "Organization", this.organization);
            this.storage.getPerson().then((person:Person) => {
              this.logger.info(this, "loadMobileApp", "Person", person);
              if (person && person.config_profile_reviewed && person.config_self_test_sent) {
                this.person = person;
                this.showCheckinList();
                resolve(true);
              }
              else {
                this.logger.info(this, "loadMobileApp", "Person", "None");
                this.showOnboardList(person);
                resolve(true);
              }
            },
            (error:any) => {
              this.logger.info(this, "loadMobileApp", "Person", "None");
              this.showOnboardList();
              resolve(true);
            });
          }
          else {
            this.logger.info(this, "loadMobileApp", "Organization", "None");
            this.showSigninUrl();
            resolve(true);
          }
        });
      },
      (error:any) => {
        this.logger.error(this, "loadMobileApp", "loadDatabase", error);
        this.hideSplashScreen();
        this.databaseChanged(models);
        resolve(false);
      });
    });
  }

  private databaseChanged(models:Model[]) {
    this.showAlert("Database Schema Changed", "The database schema has changed, your local database will need to be reset.", [{
      text: 'Reset Database',
      handler: (clicked) => {
        let loading = this.showLoading("Resetting...");
        this.resetDatabase().then((reset:any) => {
          this.loadDatabase(models).then((created:any) => {
            loading.dismiss();
            this.showSigninUrl();
          },
          (error:any) => {
            loading.dismiss();
            this.showAlert("Problem Creating Database", "There was a problem creating the database.");
            //TODO log error message
          });
        },
        (error:any) => {
          loading.dismiss();
          this.showAlert("Problem Resetting Database", "There was a problem resetting the database.");
          //TODO log error message
        });
      }
    }]);
  }

  private loadDatabase(models:Model[]):Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.mobile) {
        this.logger.info(this, "loadDatabase", "Cordova");
        this.database.loadDatabase(models).then((loaded:any) => {
          resolve(loaded);
        },
        (error:any) => {
          reject(error);
        })
      }
      else {
        this.logger.info(this, "loadDatabase", "Web");
        resolve([]);
      }
    });
  }

  private resetDatabase():Promise<any> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "resetDatabase");
      if (this.mobile) {
        this.database.deleteDatabase().then((deleted:any) => {
          resolve(deleted);
        },
        (error:any) => {
          reject(error);
        })
      }
      else {
        resolve();
      }
    });
  }

  private loadMenu() {
    this.logger.info(this, "loadMenu");
    Promise.all([
      this.loadOrganization(),
      this.loadPerson()]).then(
      (loaded:any) => {
        this.logger.info(this, "loadMenu", "Loaded");
      },
      (error:any) => {
        this.logger.error(this, "loadMenu", error);
      });
  }

  private loadOrganization():Promise<Organization> {
    return new Promise((resolve, reject) => {
      this.storage.getOrganization().then((organization:Organization) => {
        this.logger.info(this, "loadOrganization", organization);
        this.zone.run(() => {
          this.organization = organization;
        });
        resolve(organization);
      },
      (error:any) => {
        this.logger.error(this, "loadOrganization", error);
        this.organization = null;
        resolve(null);
      });
    });
  }

  private loadPerson():Promise<Person> {
    return new Promise((resolve, reject) => {
      this.storage.getPerson().then((person:Person) => {
        this.logger.info(this, "loadPerson", person);
        this.zone.run(() => {
          this.person = person;
        });
        resolve(person);
      },
      (error:any) => {
        this.logger.error(this, "loadPerson", error);
        this.person = null;
        resolve(null);
      });
    });
  }

  private showSigninUrl(event:any=null) {
    this.logger.info(this, "showSigninUrl");
    this.nav.setRoot(SigninUrlPage, { });
    this.hideSideMenu();
    this.hideSplashScreen();
  }

  private showOnboardList(person:Person=null) {
    this.logger.info(this, "showOnboardList");
    this.nav.setRoot(OnboardListPage, {
      organization: this.organization,
      person: person
    });
    this.hideSideMenu();
    this.hideSplashScreen();
  }

  private showCheckinList() {
    this.logger.info(this, "showCheckinList");
    this.nav.setRoot(CheckinListPage, {
      organization: this.organization,
      person: this.person
    });
    this.hideSideMenu();
    this.hideSplashScreen();
  }

  private showGroupList() {
    this.logger.info(this, "showGroupList");
    this.nav.setRoot(GroupListPage, {
      organization: this.organization,
      person: this.person
    });
    this.hideSideMenu();
  }

  private showNotificationList() {
    this.logger.info(this, "showNotificationList");
    this.nav.setRoot(NotificationListPage, {
      organization: this.organization,
      person: this.person,
      notifications: this.person.notifications,
    });
    this.hideSideMenu();
  }

  private showPersonList() {
    this.logger.info(this, "showPersonList");
    this.nav.setRoot(PersonListPage, {
      organization: this.organization,
      person: this.person
    });
    this.hideSideMenu();
  }

  private showSettingsList() {
    this.logger.info(this, "showSettingsList");
    this.nav.setRoot(SettingsListPage, {
      organization: this.organization,
      person: this.person
    });
    this.hideSideMenu();
  }

  private showPersonDetails() {
    this.logger.info(this, "showPersonDetails");
    this.nav.setRoot(PersonDetailsPage, {
      organization: this.organization,
      person: this.person,
      user: this.person,
      profile: true,
      title: "Profile",
      person_id: this.person.id
    });
    this.hideSideMenu();
  }

  private showSignupOwner(organization:Organization) {
    this.logger.info(this, "showSignupOwner");
    this.navController.push(SignupOwnerPage, {
      organization: organization
    });
  }

  private userLogout(event:any=null) {
    this.logger.info(this, "userLogout");
    let loading = this.showLoading("Logging out...");
    let removes = [
      this.storage.removePerson(),
      this.storage.removeOrganization()
    ];
    if (this.mobile) {
      removes.push(
        this.database.removeOrganizations(),
        this.database.removeSubscriptions(),
        this.database.removeNotifications(),
        this.database.removeCheckins(),
        this.database.removeAnswers(),
        this.database.removeReplies(),
        this.database.removeRecipients(),
        this.database.removeGroups(),
        this.database.removeEmails(),
        this.database.removePeople(),
        this.database.removeContacts());
    }
    Promise.all(removes).then((removed:any) => {
      this.organization = null;
      this.person = null;
      this.clearBadgeCount();
      this.events.publish('user:logout');
      loading.dismiss();
      this.showSigninUrl(event);
    });
  }

  private showLoading(message:string):Loading {
    let loading = this.loadingController.create({
      content: message
    });
    loading.present();
    return loading;
  }

  private showAlert(title:string, subTitle:string, buttons:any=['OK']):Alert {
    let alert = this.alertController.create({
      title: title,
      subTitle: subTitle,
      buttons: buttons
    });
    alert.present();
    return alert;
  }

  private showToast(message:string, duration:number=3000):Toast {
    let toast = this.toastController.create({
      message: message,
      duration: duration
    });
    toast.present();
    return toast;
  }

  protected showModal(page:any, params:any={}, options:any={}):Modal {
    let modal = this.modalController.create(page, params, options);
    modal.present();
    return modal;
  }

  private trackEvent(event:string, properties:any=null) {
    return this.segment.track(event, properties).then(() => {
      this.logger.info(this, "Segment", "trackEvent", event);
    });
  }

  private getParameters(query:string) {
    let parameters = {};
    if (query && query.length > 0) {
      query.split("&").forEach((parts) => {
        let items = parts.split("=");
        if (items && items.length >= 2) {
          parameters[items[0]] = decodeURIComponent(items[1]);
        }
      });
    }
    return parameters;
  }

  private hideSplashScreen() {
    if (this.mobile) {
      this.splashScreen.hide();
    }
  }

  private hideSideMenu() {
    if (this.tablet == false || this.browser == false) {
      this.menuController.close();
    }
  }

  private clearBadgeCount() {
    if (this.mobile) {
      this.badge.clear().then((cleared:any) => {
        this.logger.info(this, "badge", "Cleared", cleared);
      },
      (error:any) => {
        this.logger.error(this, "badge", "Clear Failed", error);
      });
    }
  }

  private showCheckinDetails(checkin:Checkin) {
    this.logger.info(this, "showCheckinDetails", checkin);
    this.zone.run(() => {
      this.checkin = checkin;
    });
  }

  private hideCheckin() {
    this.zone.run(() => {
      this.checkin = null;
    });
  }

  private editReply(reply:Reply, event:any) {
    this.logger.info(this, "editReply");
    if (reply.user_id == this.person.id) {
      let modal = this.showModal(CheckinRespondPage, {
        organization: this.organization,
        checkins: [this.checkin],
        checkin: this.checkin,
        reply: reply
      });
      modal.onDidDismiss(data => {
        this.logger.info(this, "editReply", "Modal", data);
        if (data) {
          if (data.canceled) {
            this.logger.info(this, "editReply", "Modal", "Canceled");
          }
          else {
            // TODO refresh the checkin list
          }
        }
     });
    }
  }

  private respondCheckin(event:any) {
    this.logger.info(this, "sendReply");
    let modal = this.showModal(CheckinRespondPage, {
      organization: this.organization,
      checkins: [this.checkin],
      checkin: this.checkin
    });
    modal.onDidDismiss(data => {
      this.logger.info(this, "sendReply", "Modal", data);
      if (data) {
        if (data.canceled) {
          this.logger.info(this, "sendReply", "Modal", "Canceled");
        }
        else {
          // TODO refresh the checkin list
        }
      }
   });
  }

  private resendCheckin(event:any) {
    this.logger.info(this, "resendCheckin");
    let loading = this.showLoading("Resending...");
    this.api.resendCheckin(this.organization, this.checkin).then((checkin:Checkin) => {
      loading.dismiss();
      this.showToast(`Check-In ${this.checkin.message} resent`);
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Resending Check-In", error);
    });
  }

}
