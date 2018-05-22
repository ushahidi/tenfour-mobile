import { Component, NgZone } from '@angular/core';
import { IonicPage, Events, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { PersonEditPage } from '../../pages/person-edit/person-edit';
import { CheckinDetailsPage } from '../../pages/checkin-details/checkin-details';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';
import { Contact } from '../../models/contact';
import { Checkin } from '../../models/checkin';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

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
export class PersonDetailsPage extends BasePage {

  organization:Organization = null;
  user:User = null;
  person:Person = null;
  title:string = null;
  loading:boolean = false;
  checkins:Checkin[] = [];
  limit:number = 3;
  offset:number = 0;
  modal:boolean = false;

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
      protected storage:StorageProvider,
      protected events:Events) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.title = this.getParameter<string>("title");
    this.modal = this.getParameter<boolean>("modal");
    let loading = this.showLoading("Loading...");
    this.loadUpdates(true).then((loaded:any) => {
      loading.dismiss();
    },
    (error:any) => {
      loading.dismiss();
    });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    if (this.organization && this.person) {
      this.trackPage({
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
        this.logger.info(this, "loadUpdates", "Done");
        if (event) {
          event.complete();
        }
        this.loading = false;
      })
      .catch((error) => {
        if (event) {
          event.complete();
        }
        this.loading = false;
        this.showToast(error);
      });
  }

  protected loadOrganization(cache:boolean=true):Promise<Organization> {
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
        });
      }
    });
  }

  protected loadUser(cache:boolean=true):Promise<User> {
    return new Promise((resolve, reject) => {
      if (cache && this.user) {
        resolve(this.user);
      }
      else if (this.hasParameter("user")){
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

  protected loadPerson(cache:boolean=true):Promise<Person> {
    return new Promise((resolve, reject) => {
      if (cache && this.person) {
        resolve(this.person);
      }
      else if (this.hasParameter("person")){
        this.person = this.getParameter<Person>("person");
        resolve(this.person);
      }
      else if (this.hasParameter("person_id")) {
        let personId = this.getParameter<number>("person_id");
        this.api.getPerson(this.organization, personId).then((person:Person) => {
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
      if (this.mobile) {
        this.storage.getCheckinsForPerson(this.organization, this.person, this.limit, this.offset).then((checkins:Checkin[]) => {
          this.checkins = checkins;
          resolve(this.checkins);
        },
        (error:any) => {
          resolve([]);
        });
      }
      else if (this.person){
        this.checkins = this.person.checkins;
        resolve(this.person.checkins);
      }
      else {
        this.checkins = [];
        resolve([]);
      }
    });
  }

  protected loadMore(event:any) {
    return new Promise((resolve, reject) => {
      if (this.mobile) {
        this.offset = this.offset + this.limit;
        this.logger.info(this, "loadMore", "Limit", this.limit, "Offset", this.offset);
        this.storage.getCheckinsForPerson(this.organization, this.person, this.limit, this.offset).then((checkins:Checkin[]) => {
          this.checkins = [...this.checkins, ...checkins];
          if (event) {
            event.complete();
          }
          resolve(this.checkins);
        },
        (error:any) => {
          if (event) {
            event.complete();
          }
          resolve([]);
        });
      }
      else {
        resolve([]);
      }
    });
  }

  protected editPerson(event:any) {
    this.logger.info(this, "editPerson");
    let modal = this.showModal(PersonEditPage, {
      organization: this.organization,
      user: this.user,
      person: this.person,
      person_id: this.person.id
    });
    modal.onDidDismiss((data:any) => {
      this.logger.info(this, "editPerson", "Modal", data);
      if (data) {
        if (data.deleted) {
          this.logger.info(this, "editPerson", "Modal", "Deleted");
          this.events.publish('account:deleted');
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
    let loading = this.showLoading("Inviting...");
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
      if (this.mobile) {
        this.socialSharing.canShareViaEmail().then(() => {
          this.socialSharing.shareViaEmail('', '', [contact.contact])
          .then(() => {
            this.logger.info(this, "emailContact", contact.contact, "Emailed");
          })
          .catch(() => {
            this.logger.error(this, "emailContact", "Error");
          });
        }).catch(() => {
          this.showToast("Email is not available...");
        });
      }
      else {
        window.open("mailto:" + contact.contact, '_blank');
      }
    }
  }

  protected showCheckinDetails(checkin:Checkin, event:any=null) {
    this.logger.info(this, "showCheckinDetails", checkin);
    if (this.platform.width() > this.WIDTH_LARGE) {
      this.showModal(CheckinDetailsPage, {
        organization: this.organization,
        user: this.user,
        person: this.person,
        checkin: checkin,
        checkin_id: checkin.id,
        modal: true
      });
    }
    else {
      this.showPage(CheckinDetailsPage, {
        organization: this.organization,
        user: this.user,
        person: this.person,
        checkin: checkin,
        checkin_id: checkin.id
      });
    }
  }

}
