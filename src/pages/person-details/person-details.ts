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
    this.loadUpdates(null, true);
  }

  loadUpdates(event:any, cache:boolean=true) {
    this.loading = true;
    Promise.all([this.loadPerson(cache)]).then(
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

  loadPerson(cache:boolean=true):Promise<Person> {
    return new Promise((resolve, reject) => {
      if (cache) {
        return this.database.getContacts(this.person).then((contacts:Contact[]) => {
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
              saves.push(this.database.saveContact(person, contact));
            }
            saves.push(this.database.savePerson(this.organization, person))
            Promise.all(saves).then(saved => {
              resolve(person);
            });
          });
      }
    });
  }

  editPerson(event:any) {
    this.logger.info(this, "editPerson");
    let modal = this.showModal(PersonEditPage,
      { organization: this.organization,
        person: this.person });
    modal.onDidDismiss((data:any) => {
      this.logger.info(this, "editPerson", "Modal", data);
      if (data) {
        if (data.deleted) {
          this.closePage();
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

  invitePerson(event:any) {
    this.logger.info(this, "invitePerson");
    let loading = this.showLoading("Inviting...");
    this.api.invitePerson(this.person).then(
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

}
