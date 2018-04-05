import { Component, NgZone } from '@angular/core';
import { IonicPage, Events, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { PersonEditPage } from '../../pages/person-edit/person-edit';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Contact } from '../../models/contact';

@IonicPage()
@Component({
  selector: 'page-person-details',
  templateUrl: 'person-details.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[ PersonEditPage ]
})
export class PersonDetailsPage extends BasePage {

  organization:Organization = null;
  person:Person = null;
  user:Person = null;
  title:string = null;
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
      protected api:ApiService,
      protected database:DatabaseService,
      protected events:Events) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.person = this.getParameter<Person>("person");
    this.user = this.getParameter<Person>("user");
    this.title = this.getParameter<string>("title");
    let loading = this.showLoading("Loading...");
    this.loadUpdates(true).then((loaded:any) => {
      loading.dismiss();
    });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.trackPage({
      organization: this.organization.name,
      person: this.person.name
    });
  }

  private loadUpdates(cache:boolean=true, event:any=null):Promise<any> {
    this.loading = true;
    return Promise.all([this.loadPerson(cache)]).then(
      (loaded:any) =>{
        if (event) {
          event.complete();
        }
        this.loading = false;
      },
      (error:any) => {
        if (event) {
          event.complete();
        }
        this.loading = false;
        this.showToast(error);
      });
  }

  private loadPerson(cache:boolean=true):Promise<Person> {
    return new Promise((resolve, reject) => {
      if (cache) {
        return this.database.getContacts(this.organization, this.person).then((contacts:Contact[]) => {
          if (contacts && contacts.length > 0) {
            this.person.contacts = contacts;
            resolve(this.person);
          }
          else {
            this.loadPerson(false).then((person:Person) => {
              resolve(person);
            })
          }
        });
      }
      else {
        return this.api.getPerson(this.organization, this.person.id).then(
          (person:Person) => {
            this.person = person;
            let saves = [];
            for (let contact of person.contacts) {
              saves.push(this.database.saveContact(this.organization, person, contact));
            }
            saves.push(this.database.savePerson(this.organization, person))
            Promise.all(saves).then(saved => {
              resolve(person);
            });
          });
      }
    });
  }

  private editPerson(event:any) {
    this.logger.info(this, "editPerson");
    let modal = this.showModal(PersonEditPage,
      { organization: this.organization,
        person: this.person,
        user: this.user });
    modal.onDidDismiss((data:any) => {
      this.logger.info(this, "editPerson", "Modal", data);
      if (data) {
        if (data.deleted) {
          this.logger.info(this, "editPerson", "Modal", "Deleted");
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

  private invitePerson(event:any) {
    this.logger.info(this, "invitePerson");
    let loading = this.showLoading("Inviting...");
    this.api.invitePerson(this.organization, this.person).then(
      (invited:Person) => {
        this.database.savePerson(this.organization, invited).then(saved => {
          this.person = invited;
          loading.dismiss();
          this.showToast("Person invited to organization");
        });
      },
      (error:any) => {
        loading.dismiss();
        this.showAlert("Problem Inviting Person", error);
      });
  }

  private phoneContact(contact:Contact) {
    this.logger.info(this, "phoneContact", contact);
    if (contact && contact.contact) {
      window.open("tel:" + contact.contact);
    }
  }

  private emailContact(contact:Contact) {
    this.logger.info(this, "phoneContact", contact);
    if (contact && contact.contact) {
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
  }

}
