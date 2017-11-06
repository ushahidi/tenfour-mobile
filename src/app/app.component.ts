import { Component, Injector, ViewChild, NgZone } from '@angular/core';
import { Platform, Nav, NavController, ModalController, Loading, LoadingController, Toast, ToastController, Alert, AlertController, MenuController } from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Deeplinks } from '@ionic-native/deeplinks';

import { SigninUrlPage } from '../pages/signin-url/signin-url';
import { SigninEmailPage } from '../pages/signin-email/signin-email';

import { SignupConfirmPage } from '../pages/signup-confirm/signup-confirm';

import { OnboardListPage } from '../pages/onboard-list/onboard-list';
import { RollcallListPage } from '../pages/rollcall-list/rollcall-list';
import { GroupListPage } from '../pages/group-list/group-list';
import { PersonListPage } from '../pages/person-list/person-list';
import { PersonDetailsPage } from '../pages/person-details/person-details';
import { SettingsListPage } from '../pages/settings-list/settings-list';

import { ApiService } from '../providers/api-service';
import { LoggerService } from '../providers/logger-service';
import { DatabaseService } from '../providers/database-service';
import { InjectorService } from '../providers/injector-service';

import { Model } from '../models/model';
import { Organization } from '../models/organization';
import { Email } from '../models/email';
import { Person } from '../models/person';
import { Contact } from '../models/contact';
import { Rollcall } from '../models/rollcall';
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
export class RollcallApp {

  zone:NgZone = null;
  rootPage:any;
  organizations:Organization[] = [];
  organization:Organization = null;
  person:Person = null;

  selectOptions:any = {
    title: 'Organizations'
  };

  @ViewChild(Nav)
  nav:Nav;

  @ViewChild('rootNavController')
  navController:NavController;

  constructor(
    protected _zone: NgZone,
    protected platform:Platform,
    protected injector:Injector,
    protected statusBar:StatusBar,
    protected splashScreen:SplashScreen,
    protected api:ApiService,
    protected database:DatabaseService,
    protected logger:LoggerService,
    protected modalController:ModalController,
    protected toastController:ToastController,
    protected loadingController:LoadingController,
    protected alertController: AlertController,
    protected menuController: MenuController,
    protected deeplinks:Deeplinks) {
    this.zone = _zone;
    InjectorService.injector = injector;
    this.platform.ready().then(() => {
      this.logger.info(this, "Platform", "Ready");
      this.loadStatusBar();
      this.loadDeepLinks();
      this.loadApplication([
        new Organization(),
        new Email(),
        new Group(),
        new Person(),
        new Contact(),
        new Rollcall(),
        new Answer(),
        new Reply(),
        new Recipient(),
        new Settings(),
        new Country(),
        new Notification(),
        new Subscription()
      ]);
    });
  }

  loadStatusBar() {
    this.logger.info(this, "loadStatusBar");
    this.statusBar.styleDefault();
  }

  loadDeepLinks() {
    this.logger.info(this, "loadDeepLinks");
    this.deeplinks.routeWithNavController(this.navController, {
      '/organization': SigninUrlPage,
      '/login/email': SigninEmailPage,
      '/organization/email/confirmation/': SignupConfirmPage }).subscribe(
      (match:any) => {
        this.logger.info(this, "Deeplinks Match", match);
      },
      (nomatch:any) => {
        this.logger.info(this, "DeepLinks No Match", nomatch);
      });
  }

  loadApplication(models:Model[]) {
    this.logger.info(this, "loadApplication");
    this.loadDatabase(models).then(
      (loaded:any) => {
        this.logger.info(this, "loadApplication", "Database", loaded);
        this.database.getOrganizations().then((organizations:Organization[]) => {
          if (organizations && organizations.length > 0) {
            this.organizations = organizations;
            this.organization = organizations[0];
            this.logger.info(this, "loadApplication", "Organization", this.organization);
            this.database.getPerson(null, true).then(
              (person:Person) => {
                this.logger.info(this, "loadApplication", "Person", person);
                if (person && person.config_profile_reviewed && person.config_self_test_sent) {
                  this.showRollcallList();
                }
                else {
                  this.showOnboardList(person);
                }
              },
              (error:any) => {
                this.logger.error(this, "loadApplication", "Person", error);
                this.showOnboardList();
              });
          }
          else {
            this.organizations = [];
            this.logger.info(this, "loadApplication", "No Organizations");
            this.showSigninUrl();
          }
        });
      },
      (error:any) => {
        this.logger.error(this, "loadApplication", "loadDatabase", error);
        this.organizations = [];
        this.splashScreen.hide();
        this.showAlert("Database Schema Changed", "The database schema has changed, your local database will need to be reset.", [{
          text: 'Reset Database',
          handler: (clicked) => {
            let loading = this.showLoading("Resetting...");
            this.resetDatabase().then(
              (reset:any) => {
                this.loadDatabase(models).then(
                  (created:any) => {
                    loading.dismiss();
                    this.showSigninUrl();
                  },
                  (error:any) => {
                    loading.dismiss();
                    this.showAlert("Problem Creating Database", "There was a problem creating the database.");
                  }
                );
              },
              (error:any) => {
                loading.dismiss();
                this.showAlert("Problem Resetting Database", "There was a problem resetting the database.");
            });
          }
        }]);
      });
  }

  loadDatabase(models:Model[]):Promise<any> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadDatabase");
      this.database.createTables(models).then(
        (created:any) => {
          this.logger.info(this, "loadDatabase", "Created");
          this.database.createIndexes(models).then((indexed:any) => {
            this.logger.info(this, "loadDatabase", "Indexed");
            let tests = [];
            for (let model of models) {
              tests.push(this.database.testModel(model));
            }
            Promise.all(tests).then(
              (passed) => {
                this.logger.info(this, "loadDatabase", "Tested");
                resolve();
              },
              (error) => {
                this.logger.error(this, "loadDatabase", "Failed", error);
                reject(error);
              });
          },
          (error:any) => {
            this.logger.error(this, "loadDatabase", "Failed", error);
            reject(error);
          });
        },
        (error:any) => {
          this.logger.error(this, "loadDatabase", "Failed", error);
          reject(error);
        });
    });
  }

  resetDatabase():Promise<any> {
    this.logger.info(this, "resetDatabase");
    return this.database.deleteDatabase();
  }

  loadMenu() {
    this.logger.info(this, "loadMenu");
    Promise.all([
      this.loadOrganizations(),
      this.loadPerson()]).then(
      (loaded:any) => {
        this.logger.info(this, "loadMenu", "Loaded");
      },
      (error:any) => {
        this.logger.error(this, "loadMenu", error);
      });
  }

  loadOrganizations():Promise<any> {
    if (this.organizations && this.organizations.length > 0) {
      this.logger.info(this, "loadOrganizations", this.organizations);
      return Promise.resolve();
    }
    else {
      return this.database.getOrganizations().then(
        (organizations:Organization[]) => {
          this.zone.run(() => {
            this.logger.info(this, "loadOrganizations", organizations);
            this.organizations = organizations;
            this.organization = organizations[0];
          });
        },
        (error:any) => {
          this.zone.run(() => {
            this.logger.error(this, "loadOrganizations", error);
            this.organizations = null;
            this.organization = null;
          });
        });
    }
  }

  loadPerson():Promise<any> {
    return this.database.getPerson(null, true).then(
      (person:Person) => {
        this.zone.run(() => {
          this.logger.info(this, "loadPerson", person);
          this.person = person;
        });
      },
      (error:any) => {
        this.zone.run(() => {
          this.logger.error(this, "loadPerson", error);
          this.person = null;
        });
      });
  }

  showSigninUrl() {
    this.logger.info(this, "showSigninUrl");
    this.nav.setRoot(SigninUrlPage, { });
    this.menuController.close();
    this.splashScreen.hide();
  }

  showOnboardList(person:Person=null) {
    this.logger.info(this, "showOnboardList");
    this.nav.setRoot(OnboardListPage,
      { organization: this.organization,
        person: person });
    this.menuController.close();
    this.splashScreen.hide();
  }

  showRollcallList() {
    this.logger.info(this, "showRollcallList");
    this.nav.setRoot(RollcallListPage,
      { organization: this.organization,
        person: this.person });
    this.menuController.close();
    this.splashScreen.hide();
  }

  showGroupList() {
    this.logger.info(this, "showGroupList");
    this.nav.setRoot(GroupListPage,
      { organization: this.organization,
        person: this.person });
    this.menuController.close();
  }

  showPersonList() {
    this.logger.info(this, "showPersonList");
    this.nav.setRoot(PersonListPage,
      { organization: this.organization,
        person: this.person });
    this.menuController.close();
  }

  showSettingsList() {
    this.logger.info(this, "showSettingsList");
    this.nav.setRoot(SettingsListPage,
      { organization: this.organization,
        person: this.person });
    this.menuController.close();
  }

  showPersonDetails() {
    this.logger.info(this, "showPersonDetails");
    this.nav.setRoot(PersonDetailsPage,
      { organization: this.organization,
        person: this.person,
        user: this.person,
        title: "Profile" });
    this.menuController.close();
  }

  userLogout() {
    this.logger.info(this, "userLogout");
    let loading = this.showLoading("Logging out...");
    let removes = [
      this.database.removeOrganizations(),
      this.database.removeSubscriptions(),
      this.database.removeNotifications(),
      this.database.removeRollcalls(),
      this.database.removeAnswers(),
      this.database.removeReplies(),
      this.database.removeRecipients(),
      this.database.removeGroups(),
      this.database.removeEmails(),
      this.database.removePeople(),
      this.database.removeContacts()];
    Promise.all(removes).then((removed:any) => {
      this.organizations = null;
      this.organization = null;
      this.person = null;
      loading.dismiss();
      this.showSigninUrl();
    });
  }

  showLoading(message:string):Loading {
    let loading = this.loadingController.create({
      content: message
    });
    loading.present();
    return loading;
  }

  showAlert(title:string, subTitle:string, buttons:any=['OK']):Alert {
    let alert = this.alertController.create({
      title: title,
      subTitle: subTitle,
      buttons: buttons
    });
    alert.present();
    return alert;
  }

  showToast(message:string, duration:number=1500):Toast {
    let toast = this.toastController.create({
      message: message,
      duration: duration
    });
    toast.present();
    return toast;
  }

}
