import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { PersonEditPage } from '../../pages/person-edit/person-edit';
import { PersonInvitePage } from '../../pages/person-invite/person-invite';
import { PersonImportPage } from '../../pages/person-import/person-import';
import { CheckinTestPage } from '../../pages/checkin-test/checkin-test';
import { CheckinListPage } from '../../pages/checkin-list/checkin-list';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'OnboardListPage',
  segment: 'onboarding'
})
@Component({
  selector: 'page-onboard-list',
  templateUrl: 'onboard-list.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ PersonEditPage, PersonInvitePage, PersonImportPage, CheckinTestPage, CheckinListPage ]
})
export class OnboardListPage extends BasePage {

  organization:Organization = null;
  person:Person = null;
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
      protected storage:StorageProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
    this.loading = true;
    this.organization = this.getParameter<Organization>("organization");
    this.person = this.getParameter<Person>("person");
    let loading = this.showLoading("Loading...");
    Promise.resolve()
      .then(() => { return this.loadPerson(); })
      .then(() => { return this.loadPeople(); })
      .then(() => {
        this.logger.info(this, "ionViewDidLoad", "Loaded");
        this.zone.run(() => {
          this.loading = false;
        });
        loading.dismiss();
      })
      .catch((error) => {
        this.logger.info(this, "ionViewDidLoad", "Failed");
        this.zone.run(() => {
          this.loading = false;
        });
        loading.dismiss();
        this.showToast(error);
      });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    if (this.organization) {
      this.analytics.trackPage(this, {
        organization: this.organization.name
      });
    }
  }

  private loadPerson():Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.getPerson(this.organization, "me").then((person:Person) => {
        this.storage.savePerson(this.organization, person).then(saved => {
          this.person = person;
          resolve(person);
        });
      });
    });
  }

  private loadPeople():Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.getPeople(this.organization).then((people:Person[]) => {
        if (people && people.length > 1) {
          this.person.config_people_invited = true;
        }
        else {
          this.person.config_people_invited = false;
        }
        this.storage.savePeople(this.organization, people).then((saved:boolean) => {
          resolve();
        });
      });
    });
  }

  private taskAddPeople(event:any) {
    this.logger.info(this, "taskAddPeople");
    let buttons = [
      {
        text: 'Add Person',
        handler: () => {
          this.addPerson();
        }
      },{
        text: 'Invite People',
        handler: () => {
          this.invitePerson();
        }
      },{
        text: 'Import People',
        handler: () => {
          this.importPerson();
        }
      },{
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
        }
      }
    ];
    this.showActionSheet(null, buttons);
  }

  private addPerson() {
    this.logger.info(this, "addPerson");
    let modal = this.showModal(PersonEditPage, {
      organization: this.organization,
      user: this.person,
      person_id: this.person.id
    });
    modal.onDidDismiss(data => {
      this.logger.info(this, "addPerson", "Modal", data);
      this.storage.getPeople(this.organization).then((people:Person[]) => {
        if (people && people.length > 1) {
          this.person.config_people_invited = true;
        }
        else {
          this.person.config_people_invited = false;
        }
      });
    });
  }

  private invitePerson() {
    this.logger.info(this, "invitePerson");
    let modal = this.showModal(PersonInvitePage, {
      organization: this.organization,
      user: this.person
    });
    modal.onDidDismiss(data => {
      this.logger.info(this, "invitePerson", "Modal", data);
      this.storage.getPeople(this.organization).then((people:Person[]) => {
        if (people && people.length > 1) {
          this.person.config_people_invited = true;
        }
        else {
          this.person.config_people_invited = false;
        }
      });
    });
  }

  private importPerson() {
    this.logger.info(this, "importPerson");
    let modal = this.showModal(PersonImportPage, {
      organization: this.organization,
      user: this.person
    });
    modal.onDidDismiss(data => {
      this.logger.info(this, "importPerson", "Modal", data);
      this.storage.getPeople(this.organization).then((people:Person[]) => {
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
    let modal = this.showModal(PersonEditPage, {
      organization: this.organization,
      person: this.person,
      person_id: this.person.id
    });
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

  private taskSendCheckin(event:any) {
    this.logger.info(this, "taskSendCheckin");
    let modal = this.showModal(CheckinTestPage, {
      organization: this.organization,
      person: this.person });
    modal.onDidDismiss(data => {
      this.logger.info(this, "taskSendCheckin", "Modal", data);
      if (data) {
        this.person.config_self_test_sent = true;
      }
      else {
        this.person.config_self_test_sent = false;
      }
    });
  }

  private showCheckinList(event:any) {
    this.logger.info(this, "showCheckinList");
    let loading = this.showLoading("Loading...");
    this.api.updatePerson(this.organization, this.person).then((person:Person) => {
      person.config_people_invited = true;
      person.config_profile_reviewed = true;
      person.config_self_test_sent = true;
      this.storage.savePerson(this.organization, this.person).then(saved => {
        loading.dismiss();
        this.showRootPage(CheckinListPage,{
          organization: this.organization
        });
      });
    },
    (error:any) => {
      this.logger.error(this, "showCheckinList", error);
      loading.dismiss();
      this.showAlert("Problem Updating User", error);
    });
  }

  private skipAhead(event:any) {
    this.logger.info(this, "skipAhead");
    this.showRootPage(CheckinListPage, {
      organization: this.organization
    });
  }

}
