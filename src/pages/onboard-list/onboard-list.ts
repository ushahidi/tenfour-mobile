import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { PersonAddPage } from '../../pages/person-add/person-add';
import { PersonEditPage } from '../../pages/person-edit/person-edit';
import { RollcallTestPage } from '../../pages/rollcall-test/rollcall-test';
import { RollcallListPage } from '../../pages/rollcall-list/rollcall-list';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';

@IonicPage()
@Component({
  selector: 'page-onboard-list',
  templateUrl: 'onboard-list.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[ PersonAddPage, PersonEditPage, RollcallTestPage, RollcallListPage ]
})
export class OnboardListPage extends BasePage {

  organization:Organization = null;
  person:Person = null;

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

  ionViewDidLoad() {
    super.ionViewDidLoad();
    this.organization = this.getParameter<Organization>("organization");
    this.person = this.getParameter<Person>("person");
    let loading = this.showLoading("Loading...");
    Promise.resolve()
      .then(() => { return this.loadPerson(); })
      .then(() => { return this.loadPeople(); })
      .then(() => {
        loading.dismiss();
      })
      .catch((error) => {
        loading.dismiss();
        this.showToast(error);
      });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.trackPage({
      organization: this.organization.name
    });
  }

  private loadPerson():Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.getPerson(this.organization, "me").then((person:Person) => {
        this.logger.info(this, "loadPerson", person);
        this.database.savePerson(this.organization, person).then(saved => {
          this.person = person;
          resolve(person);
        });
      });
    });
  }

  private loadPeople():Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.getPeople(this.organization).then((people:Person[]) => {
        let saves = [];
        for (let person of people) {
          this.logger.info(this, "loadPeople", person);
          saves.push(this.database.savePerson(this.organization, person));
        }
        Promise.all(saves).then(saved => {
          if (people && people.length > 1) {
            this.person.config_people_invited = true;
          }
          else {
            this.person.config_people_invited = false;
          }
          resolve();
        });
      });
    });
  }

  private taskAddPeople(event:any) {
    this.logger.info(this, "taskAddPeople");
    let modal = this.showModal(PersonAddPage, {
      organization: this.organization,
      person: this.person });
    modal.onDidDismiss(data => {
      this.logger.info(this, "taskAddPeople", "Modal", data);
      this.database.getPeople(this.organization).then((people:Person[]) => {
        if (people && people.length > 1) {
          this.person.config_people_invited = true;
        }
        else {
          this.person.config_people_invited = false;
        }
      });
   });
  }

  private taskReviewContact(event:any) {
    this.logger.info(this, "taskReviewContact");
    if (this.person.config_people_invited || this.person.role == 'member') {
      this.person.config_profile_reviewed = true;
      let modal = this.showModal(PersonEditPage, {
        organization: this.organization,
        person: this.person });
      modal.onDidDismiss(data => {
        this.logger.info(this, "taskReviewContact", "Modal", data);
        if (data) {
          this.person.config_profile_reviewed = true;
        }
        else {
          this.person.config_profile_reviewed = false;
        }
     });
    }
  }

  private taskSendRollCall(event:any) {
    this.logger.info(this, "taskSendRollCall");
    if (this.person.config_people_invited && this.person.config_people_invited) {
      let modal = this.showModal(RollcallTestPage, {
        organization: this.organization,
        person: this.person });
      modal.onDidDismiss(data => {
        this.logger.info(this, "taskSendRollCall", "Modal", data);
        if (data) {
          this.person.config_self_test_sent = true;
        }
        else {
          this.person.config_self_test_sent = false;
        }
     });
    }
  }

  private showRollcallList(event:any) {
    this.logger.info(this, "showRollcallList");
    let loading = this.showLoading("Loading...");
    this.api.updatePerson(this.organization, this.person).then((person:Person) => {
      person.config_people_invited = true;
      person.config_profile_reviewed = true;
      person.config_self_test_sent = true;
      this.database.savePerson(this.organization, this.person).then(saved => {
        loading.dismiss();
        this.showRootPage(RollcallListPage,
          { organization: this.organization });
      });
    },
    (error:any) => {
      this.logger.error(this, "showRollcallList", error);
      loading.dismiss();
      this.showAlert("Problem Updating User", error);
    });
  }

}
