import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';
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
export class OnboardListPage extends BasePrivatePage {

  organization:Organization = null;
  user:User = null;
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
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
    let loading = this.showLoading("Loading...");
    this.loadUpdates(false).then((finished:any) => {
      loading.dismiss();
    },
    (error:any) => {
      loading.dismiss();
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

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    this.loading = true;
    return Promise.resolve()
      .then(() => { return this.loadOrganization(cache); })
      .then(() => { return this.loadUser(cache); })
      .then(() => { return this.loadPeople(cache); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Loaded");
        if (event) {
          event.complete();
        }
        this.loading = false;
      })
      .catch((error:any) => {
        this.logger.error(this, "loadUpdates", "Failed", error);
        if (event) {
          event.complete();
        }
        this.loading = false;
        this.showToast(error);
      });
  }

  private loadPeople(cache:boolean=true):Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.getPeople(this.organization).then((people:Person[]) => {
        if (people && people.length > 1) {
          this.user.config_people_invited = true;
        }
        else {
          this.user.config_people_invited = false;
        }
        this.storage.savePeople(this.organization, people).then((saved:boolean) => {
          resolve();
        });
      },
      (error:any) => {
        reject(error);
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
      user: this.user,
      person_id: this.user.id
    });
    modal.onDidDismiss(data => {
      this.logger.info(this, "addPerson", "Modal", data);
      this.storage.getPeople(this.organization).then((people:Person[]) => {
        if (people && people.length > 1) {
          this.user.config_people_invited = true;
        }
        else {
          this.user.config_people_invited = false;
        }
      });
    });
  }

  private invitePerson() {
    this.logger.info(this, "invitePerson");
    let modal = this.showModal(PersonInvitePage, {
      organization: this.organization,
      user: this.user
    });
    modal.onDidDismiss(data => {
      this.logger.info(this, "invitePerson", "Modal", data);
      this.storage.getPeople(this.organization).then((people:Person[]) => {
        if (people && people.length > 1) {
          this.user.config_people_invited = true;
        }
        else {
          this.user.config_people_invited = false;
        }
      });
    });
  }

  private importPerson() {
    this.logger.info(this, "importPerson");
    let modal = this.showModal(PersonImportPage, {
      organization: this.organization,
      user: this.user
    });
    modal.onDidDismiss(data => {
      this.logger.info(this, "importPerson", "Modal", data);
      this.storage.getPeople(this.organization).then((people:Person[]) => {
        if (people && people.length > 1) {
          this.user.config_people_invited = true;
        }
        else {
          this.user.config_people_invited = false;
        }
      });
    });
  }

  private taskReviewContact(event:any) {
    this.logger.info(this, "taskReviewContact");
    let modal = this.showModal(PersonEditPage, {
      organization: this.organization,
      user: this.user,
      person: this.user,
      person_id: this.user.id
    });
    modal.onDidDismiss(data => {
      this.logger.info(this, "taskReviewContact", "Modal", data);
      if (data) {
        this.user.config_profile_reviewed = true;
      }
      else {
        this.user.config_profile_reviewed = false;
      }
   });
  }

  private taskSendCheckin(event:any) {
    this.logger.info(this, "taskSendCheckin");
    let modal = this.showModal(CheckinTestPage, {
      organization: this.organization,
      user: this.user
    });
    modal.onDidDismiss(data => {
      this.logger.info(this, "taskSendCheckin", "Modal", data);
      if (data) {
        this.user.config_self_test_sent = true;
      }
      else {
        this.user.config_self_test_sent = false;
      }
    });
  }

  private showCheckinList(event:any) {
    this.logger.info(this, "showCheckinList");
    let loading = this.showLoading("Loading...");
    this.api.updatePerson(this.organization, this.user).then((person:Person) => {
      person.config_people_invited = true;
      person.config_profile_reviewed = true;
      person.config_self_test_sent = true;
      Promise.all([
        this.storage.setUser(person),
        this.storage.savePerson(this.organization, person)])
        .then(() => {
          loading.dismiss();
          this.showRootPage(CheckinListPage,{
            organization: this.organization,
            user: person
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
      organization: this.organization,
      user: this.user
    });
  }

}
