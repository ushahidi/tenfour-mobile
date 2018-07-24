import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';
import { PersonEditPage } from '../../pages/person-edit/person-edit';
import { CheckinDetailsPage } from '../../pages/checkin-details/checkin-details';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';
import { Contact } from '../../models/contact';
import { Checkin } from '../../models/checkin';
import { Reply } from '../../models/reply';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

import { EVENT_ACCOUNT_DELETED } from '../../constants/events';

@IonicPage({
  name: 'PersonDetailsPage',
  segment: 'people/:person_id',
  defaultHistory: ['PersonListPage']
})
@Component({
  selector: 'page-person-details',
  templateUrl: 'person-details.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ PersonEditPage, CheckinDetailsPage ]
})
export class PersonDetailsPage extends BasePrivatePage {

  person:Person = null;
  profile:boolean = false;
  loading:boolean = false;
  limit:number = 3;
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
    if (this.organization && this.person) {
      this.analytics.trackPage(this, {
        organization: this.organization.name,
        person: this.person.name
      });
    }
  }

  protected loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    this.loading = true;
    return Promise.resolve()
      .then(() => { return this.loadOrganization(cache); })
      .then(() => { return this.loadUser(cache); })
      .then(() => { return this.loadPerson(cache); })
      .then(() => { return this.loadCheckins(cache); })
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

  protected loadPerson(cache:boolean=true):Promise<Person> {
    return new Promise((resolve, reject) => {
      if (cache && this.person) {
        resolve(this.person);
      }
      else if (cache && this.hasParameter("person")){
        this.person = this.getParameter<Person>("person");
        resolve(this.person);
      }
      else if (this.hasParameter("person_id")) {
        let personId = this.getParameter<number>("person_id");
        this.promiseFallback(cache,
          this.storage.getPerson(this.organization, personId),
          this.api.getPerson(this.organization, personId)).then((person:Person) => {
            this.person = person;
            resolve(person);
        },
        (error:any) => {
          resolve(null);
        });
      }
      else {
        reject("Person Not Provided");
      }
    });
  }

  protected loadCheckins(cache:boolean=true):Promise<Checkin[]> {
    return new Promise((resolve, reject) => {
      if (this.person.groups == null || this.person.groups.length == 0 ||
          this.person.checkins == null || this.person.checkins.length == 0) {
        this.promiseFallback(cache,
          this.storage.getPerson(this.organization, this.person.id),
          this.api.getPerson(this.organization, this.person.id)).then((person:Person) => {
            this.person.groups = person.groups;
            this.person.checkins = person.checkins;
            this.person.replies = person.replies;
            resolve(this.person.checkins);
          },
          (error:any) => {
            this.person.groups = [];
            this.person.checkins = [];
            resolve([]);
          });
      }
      else {
        resolve(this.person.checkins);
      }
    });
  }

  protected loadMore(event:any) {
    return new Promise((resolve, reject) => {
      this.offset = this.offset + this.limit;
      this.logger.info(this, "loadMore", "Limit", this.limit, "Offset", this.offset);
      this.promiseFallback(true,
        this.storage.getCheckinsForPerson(this.organization, this.person, this.limit, this.offset),
        this.api.getCheckinsForPerson(this.organization, this.person, this.limit, this.offset), 1).then((checkins:Checkin[]) => {
          this.logger.info(this, "loadMore", "Limit", this.limit, "Offset", this.offset, "Checkins", checkins);
          this.person.checkins = [...this.person.checkins, ...checkins];
          resolve(this.person.checkins);
        },
        (error:any) => {
          resolve([]);
        });
    });
  }

  protected editPerson(event:any) {
    this.logger.info(this, "editPerson");
    let modal = this.showModal(PersonEditPage, {
      organization: this.organization,
      user: this.user,
      person: this.person,
      person_id: this.person.id,
      profile: this.profile
    });
    modal.onDidDismiss((data:any) => {
      this.logger.info(this, "editPerson", "Modal", data);
      if (data) {
        if (data.deleted) {
          this.logger.info(this, "editPerson", "Modal", "Deleted");
          this.events.publish(EVENT_ACCOUNT_DELETED);
        }
        else if (data.removed) {
          this.logger.info(this, "editPerson", "Modal", "Removed");
          this.closePage();
        }
        else if (data.canceled) {
          this.logger.info(this, "editPerson", "Modal", "Cancelled");
        }
        else {
          let loading = this.showLoading("Loading...");
          this.loadPerson(true).then(person => {
            this.person = person;
            loading.dismiss();
          });
        }
      }
    });
  }

  protected invitePerson(event:any) {
    this.logger.info(this, "invitePerson");
    let loading = this.showLoading("Inviting...", true);
    this.api.invitePerson(this.organization, this.person).then((invited:Person) => {
      if (this.mobile) {
        this.storage.savePerson(this.organization, invited).then(saved => {
          this.person = invited;
          loading.dismiss();
          if (this.person.name) {
            this.showToast(`${this.person.name} invited to organization`);
          }
          else {
            this.showToast("Person invited to organization");
          }
        });
      }
      else {
        this.person = invited;
        loading.dismiss();
        if (this.person.name) {
          this.showToast(`${this.person.name} invited to organization`);
        }
        else {
          this.showToast("Person invited to organization");
        }
      }
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Inviting Person", error);
    });
  }

  protected phoneContact(contact:Contact) {
    this.logger.info(this, "phoneContact", contact);
    if (contact && contact.contact) {
      window.open("tel:" + contact.contact, '_blank');
    }
  }

  protected emailContact(contact:Contact) {
    this.logger.info(this, "phoneContact", contact);
    if (contact && contact.contact) {
      this.sharing.sendEmail(contact.contact);
    }
  }

  protected showAddress(contact:Contact) {
    if (contact && contact.contact && contact.contact.length > 0) {
      let url = `https://www.google.com/maps/search/${contact.contact}`;
      this.showUrl(url);
    }
  }

  protected showCheckinDetails(checkin:Checkin, event:any=null) {
    this.logger.info(this, "showCheckinDetails", checkin);
    this.showModalOrPage(CheckinDetailsPage, {
      organization: this.organization,
      user: this.user,
      person: this.person,
      checkin: checkin,
      checkin_id: checkin.id
    });
  }

}
