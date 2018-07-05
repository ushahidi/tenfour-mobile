import { Component, Injector, ViewChild, NgZone } from '@angular/core';
import { Platform, Events, Nav, SplitPane, NavController, ModalController, Modal, Loading, LoadingController, Toast, ToastController, Alert, AlertController, MenuController } from 'ionic-angular';

import { SplashScreenPage } from '../pages/splash-screen/splash-screen';

import { SigninUrlPage } from '../pages/signin-url/signin-url';
import { SigninEmailPage } from '../pages/signin-email/signin-email';
import { SigninPasswordPage } from '../pages/signin-password/signin-password';

import { SignupEmailPage } from '../pages/signup-email/signup-email';
import { SignupCheckPage } from '../pages/signup-check/signup-check';
import { SignupVerifyPage } from '../pages/signup-verify/signup-verify';
import { SignupOwnerPage } from '../pages/signup-owner/signup-owner';
import { SignupPasswordPage } from '../pages/signup-password/signup-password';

import { OnboardListPage } from '../pages/onboard-list/onboard-list';

import { PasswordResetPage } from '../pages/password-reset/password-reset';

import { CheckinListPage } from '../pages/checkin-list/checkin-list';
import { CheckinRespondPage } from '../pages/checkin-respond/checkin-respond';

import { ContactsImportPage } from '../pages/contacts-import/contacts-import';
import { ContactsMatchPage } from '../pages/contacts-match/contacts-match';

import { GroupListPage } from '../pages/group-list/group-list';
import { PersonListPage } from '../pages/person-list/person-list';
import { PersonProfilePage } from '../pages/person-profile/person-profile';
import { SettingsListPage } from '../pages/settings-list/settings-list';
import { NotificationListPage } from '../pages/notification-list/notification-list';
import { SettingsPaymentsPage } from '../pages/settings-payments/settings-payments';

import { Model } from '../models/model';
import { Organization } from '../models/organization';
import { User } from '../models/user';
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
import { Deeplink } from '../models/deeplink';

import { ApiProvider } from '../providers/api/api';
import { BadgeProvider } from '../providers/badge/badge';
import { LoggerProvider } from '../providers/logger/logger';
import { StorageProvider } from '../providers/storage/storage';
import { InjectorProvider } from '../providers/injector/injector';
import { AnalyticsProvider } from '../providers/analytics/analytics';
import { NetworkProvider } from '../providers/network/network';
import { OrientationProvider } from '../providers/orientation/orientation';
import { StatusBarProvider } from '../providers/status-bar/status-bar';
import { SplashScreenProvider } from '../providers/splash-screen/splash-screen';
import { FirebaseProvider } from '../providers/firebase/firebase';
import { DeeplinksProvider } from '../providers/deeplinks/deeplinks';

@Component({
  templateUrl: 'app.html'
})
export class TenFourApp {

  zone:NgZone = null;
  rootPage:any = SplashScreenPage;
  organization:Organization = null;
  user:User = null;
  tablet:boolean = false;
  mobile:boolean = false;
  phone:boolean = false;
  android:boolean = false;
  ios:boolean = false;
  website:boolean = false;
  desktop:boolean = false;

  defaultLogo:string = "assets/images/dots.png";

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
    protected api:ApiProvider,
    protected storage:StorageProvider,
    protected logger:LoggerProvider,
    protected badge:BadgeProvider,
    protected analytics:AnalyticsProvider,
    protected network:NetworkProvider,
    protected statusBar:StatusBarProvider,
    protected splashScreen:SplashScreenProvider,
    protected orientation:OrientationProvider,
    protected modalController:ModalController,
    protected toastController:ToastController,
    protected loadingController:LoadingController,
    protected alertController:AlertController,
    protected menuController:MenuController,
    protected deeplinks:DeeplinksProvider,
    protected firebase:FirebaseProvider) {
    this.zone = _zone;
    InjectorProvider.injector = injector;
    this.platform.ready().then((ready) => {
      if (this.platform.is("cordova")) {
        Promise.resolve()
          .then(() => this.loadPlatforms())
          .then(() => this.loadStatusBar())
          .then(() => this.loadOrientation())
          .then(() => this.loadAnalytics())
          .then(() => this.loadEvents())
          .then(() => this.loadDeepLinks())
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
      this.desktop = this.platform.is('core');
      this.phone = this.platform.is('cordova') && this.platform.is('tablet') == false;
      this.website = this.platform.is('mobileweb') || this.platform.is('cordova') == false;
      resolve(true);
    });
  }

  private loadOrientation():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.orientation.onChanged().subscribe((type:string) => {
        this.logger.info(this, "Orientation", type);
      });
      resolve(true);
    });
  }

  private loadStatusBar():Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.ios) {
        this.logger.info(this, "loadStatusBar", "iOS");
        this.statusBar.setStyle(false);
        this.statusBar.setOverlaysWebView(false);
        this.statusBar.setColor("#F5F5F1");
      }
      else if (this.android) {
        this.logger.info(this, "loadStatusBar", "Android");
        this.statusBar.setStyle(true);
        this.statusBar.setOverlaysWebView(false);
        this.statusBar.setColor("#000000");
      }
      resolve(true);
    });
  }

  private loadAnalytics():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.analytics.initialize().then((loaded:any) => {
        this.logger.info(this, "loadAnalytics", "Loaded");
      },
      (error:any) => {
        this.logger.error(this, "loadAnalytics", "Failed", error);
      });
      resolve(true);
    });
  }

  private loadDeepLinks():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.deeplinks.onMatch(this.navController).subscribe((deeplink:Deeplink) => {
        this.logger.info(this, "loadDeepLinks", "onMatch", deeplink);
        if (deeplink) {
          if (deeplink.path === '/organization/email/confirmation/') {
            let email = deeplink.parameters['email'];
            let code = deeplink.parameters['code'];
            this.showSignupVerify(email, code);
          }
          else if (deeplink.path === '/login/email') {
             //SigninEmailPage
          }
          else if (deeplink.path === '/login/password') {
             //SigninPasswordPage
          }
          else if (deeplink.path === '/login/invite') {
             //SignupPasswordPage
          }
        }
      },
      (error:any) => {
        this.logger.error(this, "loadDeepLinks", "onMatch", error);
      });
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
      this.events.subscribe('subscription:changed', (subscription, time) => {
        this.loadOrganization();
      });
      resolve(true);
    })
  }

  private loadNotifications():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.firebase.initialize().then((loaded:boolean) => {
        this.logger.info(this, "loadNotifications", "Loaded");
        resolve(true);
      },
      (error:any) => {
        this.logger.error(this, "loadNotifications", "Failed", error);
        resolve(false);
      });
    });
  }

  private loadWebApp() {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadWebApp");
      this.storage.getOrganization().then((organization:Organization) => {
        this.logger.info(this, "loadWebApp", "Organization", organization);
        this.organization = organization;
        this.storage.getUser().then((user:User) => {
          this.logger.info(this, "loadWebApp", "User", user);
          this.user = user;
          if (user && user.config_profile_reviewed && user.config_self_test_sent) {
            if (this.hasLocationHash() == false) {
              this.showCheckinList();
            }
            resolve(true);
          }
          else {
            if (this.hasLocationHash() == false) {
              this.showOnboardList(user);
            }
            resolve(true);
          }
        },
        (error:any) => {
          this.logger.info(this, "loadWebApp", "User", "None");
          if (this.hasLocationHash() == false) {
            this.showSigninUrl();
          }
          resolve(false);
        });
      },
      (error:any) => {
        this.logger.info(this, "loadWebApp", "Organization", "None");
        if (this.hasLocationHash() == false) {
          this.showSigninUrl();
        }
        resolve(false);
      });
    });
  }

  private loadMobileApp(models:Model[]):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadMobileApp");
      this.loadDatastore(models).then((loaded:any) => {
        this.logger.info(this, "loadMobileApp", "Database", loaded);
        this.storage.getOrganization().then((organization:Organization) => {
          this.logger.info(this, "loadMobileApp", "Organization", this.organization);
          if (organization) {
            this.organization = organization;
            this.storage.getUser().then((user:User) => {
              this.logger.info(this, "loadMobileApp", "User", user);
              if (user && user.config_profile_reviewed && user.config_self_test_sent) {
                this.user = user;
                this.showCheckinList();
                resolve(true);
              }
              else {
                this.logger.info(this, "loadMobileApp", "User", "None");
                this.showOnboardList(user);
                resolve(true);
              }
            },
            (error:any) => {
              this.logger.info(this, "loadMobileApp", "User", "None");
              this.showOnboardList();
              resolve(true);
            });
          }
          else {
            this.logger.info(this, "loadMobileApp", "Organization", "None");
            this.showSigninUrl();
            resolve(true);
          }
        },
        (error:any) => {
          this.logger.info(this, "loadMobileApp", "Organization", "None");
          this.showSigninUrl();
          resolve(true);
        });
      },
      (error:any) => {
        this.logger.error(this, "loadMobileApp", "loadDatastore", error);
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
        let loading = this.showLoading("Resetting...", true);
        this.resetDatastore().then((reset:any) => {
          this.loadDatastore(models).then((created:any) => {
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

  private loadDatastore(models:Model[]):Promise<any> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadDatastore", "Cordova");
      this.storage.initialize(models).then((loaded:any) => {
        resolve(loaded);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  private resetDatastore():Promise<any> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "resetDatastore");
      this.storage.reset().then((reset:any) => {
        resolve(reset);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  private loadMenu() {
    this.logger.info(this, "loadMenu");
    Promise.all([
      this.loadOrganization(),
      this.loadUser()]).then(
      (loaded:any) => {
        this.logger.info(this, "loadMenu", "Loaded");
      },
      (error:any) => {
        this.logger.error(this, "loadMenu", "Failed", error);
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

  private loadUser():Promise<User> {
    return new Promise((resolve, reject) => {
      this.storage.getUser().then((user:User) => {
        this.logger.info(this, "loadUser", user);
        this.zone.run(() => {
          this.user = user;
        });
        resolve(user);
      },
      (error:any) => {
        this.logger.error(this, "loadUser", error);
        this.user = null;
        resolve(null);
      });
    });
  }

  private showSigninUrl(event:any=null) {
    this.logger.info(this, "showSigninUrl");
    this.nav.setRoot(SigninUrlPage, { }).then((loaded:any) => {
      this.logger.info(this, "showSigninUrl", "Loaded");
      this.hideSideMenu();
      this.hideSplashScreen();
    },
    (error:any) => {
      this.logger.error(this, "showSigninUrl", error);
    });
  }

  private showSignupVerify(email:string, code:string) {
    let organization = new Organization({email: email});
    return Promise.resolve()
      .then(() => { return this.nav.setRoot(SigninUrlPage, {}); })
      .then(() => { return this.nav.push(SignupEmailPage, {}); })
      .then(() => { return this.nav.push(SignupVerifyPage, { organization:organization, email:email, code:code }); })
      .then((loaded:any) => {
        this.logger.info(this, "showSignupVerify", "Loaded");
        this.hideSideMenu();
        this.hideSplashScreen();
      },
      (error:any) => {
        this.logger.error(this, "showSignupVerify", error);
      });
  }

  private showOnboardList(user:User=null) {
    this.logger.info(this, "showOnboardList");
    this.nav.setRoot(OnboardListPage, {
      organization: this.organization,
      user: user
    }).then((loaded:any) => {
      this.logger.info(this, "showOnboardList", "Loaded");
      this.hideSplashScreen();
    },
    (error:any) => {
      this.logger.error(this, "showOnboardList", error);
    });
  }

  private showCheckinList(event:any=null) {
    this.logger.info(this, "showCheckinList");
    this.nav.setRoot(CheckinListPage, {
      organization: this.organization,
      user: this.user
    }).then((loaded:any) => {
      this.logger.info(this, "showCheckinList", "Loaded");
      this.hideSideMenu();
      this.hideSplashScreen();
    },
    (error:any) => {
      this.logger.error(this, "showCheckinList", error);
    });
  }

  private showGroupList(event:any=null) {
    this.logger.info(this, "showGroupList");
    this.nav.setRoot(GroupListPage, {
      organization: this.organization,
      user: this.user
    }).then((loaded:any) => {
      this.logger.info(this, "showGroupList", "Loaded");
      this.hideSideMenu();
      this.hideSplashScreen();
    },
    (error:any) => {
      this.logger.error(this, "showGroupList", error);
    });
  }

  private showNotificationList(event:any=null) {
    this.logger.info(this, "showNotificationList");
    this.nav.setRoot(NotificationListPage, {
      organization: this.organization,
      user: this.user,
      notifications: this.user.notifications,
    }).then((loaded:any) => {
      this.logger.info(this, "showNotificationList", "Loaded");
      this.hideSideMenu();
      this.hideSplashScreen();
    },
    (error:any) => {
      this.logger.error(this, "showNotificationList", error);
    });
  }

  private showPersonList(event:any=null) {
    this.logger.info(this, "showPersonList");
    this.nav.setRoot(PersonListPage, {
      organization: this.organization,
      user: this.user
    }).then((loaded:any) => {
      this.logger.info(this, "showPersonList", "Loaded");
      this.hideSideMenu();
      this.hideSplashScreen();
    },
    (error:any) => {
      this.logger.error(this, "showPersonList", error);
    });
  }

  private showPersonProfile(event:any=null) {
    this.logger.info(this, "showPersonProfile");
    this.nav.setRoot(PersonProfilePage, {
      organization: this.organization,
      user: this.user,
      person: this.user,
      person_id: this.user.id,
      profile: true
    }).then((loaded:any) => {
      this.logger.info(this, "showPersonProfile", "Loaded");
      this.hideSideMenu();
      this.hideSplashScreen();
    },
    (error:any) => {
      this.logger.error(this, "showPersonProfile", error);
    });
  }

  private showSettingsList(event:any=null) {
    this.logger.info(this, "showSettingsList");
    this.nav.setRoot(SettingsListPage, {
      organization: this.organization,
      user: this.user
    }).then((loaded:any) => {
      this.logger.info(this, "showSettingsList", "Loaded");
      this.hideSideMenu();
      this.hideSplashScreen();
    },
    (error:any) => {
      this.logger.error(this, "showSettingsList", error);
    });
  }

  private showSignupOwner(organization:Organization) {
    this.logger.info(this, "showSignupOwner");
    this.navController.push(SignupOwnerPage, {
      organization: organization
    });
  }

  private userLogout(event:any=null) {
    this.logger.info(this, "userLogout");
    let loading = this.showLoading("Logging out...", true);
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
      this.storage.removeContacts()
    ];
    Promise.all(removes).then((removed:any) => {
      this.organization = null;
      this.user = null;
      this.clearBadgeCount();
      this.events.publish('user:logout');
      loading.dismiss();
      this.showSigninUrl(event);
    });
  }

  private showLoading(message:string, important:boolean=false):Loading {
    let loading = this.loadingController.create({
      content: message
    });
    if (important || this.mobile) {
      loading.present();
    }
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
    if (params) {
      params['modal'] = true;
    }
    let modal = this.modalController.create(page, params, options);
    modal.present();
    return modal;
  }

  private hideSplashScreen() {
    this.splashScreen.hide();
  }

  private hideSideMenu() {
    if (this.tablet == false || this.website == false) {
      this.menuController.close();
    }
  }

  private clearBadgeCount() {
    this.badge.clearBadgeNumber().then((cleared:any) => {
      this.logger.info(this, "badge", "Cleared", cleared);
    },
    (error:any) => {
      this.logger.error(this, "badge", "Clear Failed", error);
    });
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
    if (reply.user_id == this.user.id) {
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
    let loading = this.showLoading("Resending...", true);
    this.api.resendCheckin(this.organization, this.checkin).then((checkin:Checkin) => {
      loading.dismiss();
      this.showToast(`Check-In ${this.checkin.message} resent`);
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Resending Check-In", error);
    });
  }

  private upgradeToPro(event:any) {
    this.logger.info(this, "upgradeToPro");
    this.navController.push(SettingsPaymentsPage);
  }

  private locationHash():string {
    if (location && location.hash) {
        return location.hash;
    }
    return "";
  }

  private hasLocationHash():boolean {
    if (location && location.hash) {
        return location.hash.length > 0;
    }
    return false;
  }

}
