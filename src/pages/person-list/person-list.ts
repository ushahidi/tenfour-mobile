import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { PersonDetailsPage } from '../../pages/person-details/person-details';
import { PersonEditPage } from '../../pages/person-edit/person-edit';
import { PersonInvitePage } from '../../pages/person-invite/person-invite';
import { PersonImportPage } from '../../pages/person-import/person-import';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'PersonListPage',
  segment: 'people'
})
@Component({
  selector: 'page-person-list',
  templateUrl: 'person-list.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ PersonDetailsPage, PersonEditPage, PersonInvitePage, PersonImportPage ]
})
export class PersonListPage extends BasePage {

  organization:Organization = null;
  user:User = null;
  loading:boolean = false;
  limit:number = 20;
  offset:number = 0;

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
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.loading = true;
    let loading = this.showLoading("Loading...");
    this.loadUpdates(true).then((finished:any) => {
      loading.dismiss();
      this.loading = false;
    },
    (error:any) => {
      loading.dismiss();
      this.loading = false;
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

  private loadOrganization(cache:boolean=true):Promise<Organization> {
    return new Promise((resolve, reject) => {
      if (cache && this.organization) {
        resolve(this.organization);
      }
      else if (cache && this.hasParameter("organization")){
        this.organization = this.getParameter<Organization>("organization");
        resolve(this.organization);
      }
      else {
        this.storage.getOrganization().then((organization:Organization) => {
          this.organization = organization;
          resolve(this.organization);
        });
      }
    });
  }

  private loadUser(cache:boolean=true):Promise<User> {
    return new Promise((resolve, reject) => {
      if (cache && this.user) {
        resolve(this.user);
      }
      else if (cache && this.hasParameter("user")){
        this.user = this.getParameter<User>("user");
        resolve(this.user);
      }
      else {
        this.storage.getUser().then((user:User) => {
          this.user = user;
          resolve(this.user);
        });
      }
    });
  }

  private loadPeople(cache:boolean=true) {
    return new Promise((resolve, reject) => {
      this.offset = 0;
      this.promiseFallback(cache,
        this.storage.getPeople(this.organization, null, this.limit, this.offset),
        this.api.getPeople(this.organization, this.limit, this.offset), 2).then((people:Person[]) => {
          this.storage.savePeople(this.organization, people).then((saved:boolean) => {
            this.organization.people = people;
            resolve(people);
          });
        },
        (error:any) => {
          this.organization.people = [];
          reject(error);
        });
    });
  }

  private loadMore(event:any) {
    return new Promise((resolve, reject) => {
      this.offset = this.offset + this.limit;
      this.logger.info(this, "loadMore", "Limit", this.limit, "Offset", this.offset);
      this.promiseFallback(true,
        this.storage.getPeople(this.organization, null, this.limit, this.offset),
        this.api.getPeople(this.organization, this.limit, this.offset), 1).then((people:Person[]) => {
          this.storage.savePeople(this.organization, people).then((saved:boolean) => {
            this.organization.people = [...this.organization.people, ...people];
            if (event) {
              event.complete();
            }
            this.logger.info(this, "loadMore", "Limit", this.limit, "Offset", this.offset, "Total", this.organization.people.length);
            resolve(this.organization.people);
          });
        });
    });
  }

  private addPeople(event:any) {
    this.logger.info(this, "addPeople");
    let buttons = [];
    buttons.push({
      text: 'Add Person',
      handler: () => {
        this.addPerson();
      }
    });
    buttons.push({
      text: 'Invite Person',
      handler: () => {
        this.invitePerson();
      }
    });
    if (this.mobile) {
      buttons.push({
        text: 'Import People',
        handler: () => {
          this.importPerson();
        }
      });
    }
    buttons.push({
      text: 'Cancel',
      role: 'cancel'
    });
    this.showActionSheet(null, buttons);
  }

  private addPerson() {
    this.logger.info(this, "addPerson");
    let modal = this.showModal(PersonEditPage, {
      organization: this.organization,
      user: this.user,
      modal: true
    });
    modal.onDidDismiss(data => {
      this.logger.info(this, "addPerson", "Modal", data);
      if (data) {
        let loading = this.showLoading("Loading...");
        this.loadPeople(true).then((finished:any) => {
          loading.dismiss();
          if (data.person) {
            this.showPerson(data.person);
          }
        },
        (error:any) => {
          loading.dismiss();
        });
      }
    });
  }

  private invitePerson() {
    this.logger.info(this, "invitePerson");
    let modal = this.showModal(PersonInvitePage, {
      organization: this.organization,
      user: this.user,
      modal: true
    });
    modal.onDidDismiss(data => {
      this.logger.info(this, "invitePerson", "Modal", data);
      if (data) {
        let loading = this.showLoading("Loading...");
        this.loadPeople(true).then((finished:any) => {
          loading.dismiss();
        },
        (error:any) => {
          loading.dismiss();
        });
      }
    });
  }

  private importPerson() {
    this.logger.info(this, "importPerson");
    let modal = this.showModal(PersonImportPage, {
      organization: this.organization,
      user: this.user,
      modal: true
    });
    modal.onDidDismiss(data => {
      this.logger.info(this, "importPerson", "Modal", data);
      if (data) {
        let loading = this.showLoading("Loading...");
        this.loadPeople(true).then((finished:any) => {
          loading.dismiss();
        },
        (error:any) => {
          loading.dismiss();
        });
      }
    });
  }

  private showPerson(person:Person, event:any=null) {
    this.logger.info(this, "showPerson", person);
    if (this.platform.width() > this.WIDTH_LARGE) {
      this.showModal(PersonDetailsPage, {
        organization: this.organization,
        user: this.user,
        person: person,
        person_id: person.id,
        modal: true
      });
    }
    else {
      this.showPage(PersonDetailsPage, {
        organization: this.organization,
        user: this.user,
        person: person,
        person_id: person.id
      });
    }
  }

  private removePerson(person:Person, event:any=null) {
    this.logger.info(this, "removePerson", person);
    let loading = this.showLoading("Removing...", true);
    this.api.deletePerson(this.organization, person).then((deleted:any) => {
      if (this.mobile) {
        let removes = [];
        removes.push(this.storage.removePerson(this.organization, person));
        for (let contact of person.contacts) {
          removes.push(this.storage.removeContact(this.organization, contact));
        }
        Promise.all(removes).then(removed => {
          let index = this.organization.people.indexOf(person);
          if (index > -1) {
            this.organization.people.splice(index, 1);
          }
          loading.dismiss();
        });
      }
      else {
        let index = this.organization.people.indexOf(person);
        if (index > -1) {
          this.organization.people.splice(index, 1);
        }
        loading.dismiss();
      }
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Removing Person", error);
    });
  }

}
