import { Component, NgZone } from '@angular/core';
import { IonicPage, Events, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Contact } from '../../models/contact';
import { Token } from '../../models/token';

@IonicPage()
@Component({
  selector: 'page-person-edit',
  templateUrl: 'person-edit.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[  ]
})
export class PersonEditPage extends BasePage {

  organization:Organization = null;
  person:Person = null;
  editing:boolean = true;

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
    if (this.person) {
      this.editing = true;
    }
    else {
      this.editing = false;
      this.person = new Person({
        name: null,
        description: null,
        organization_id: this.organization.id
      });
    }
  }

  cancelEdit(event) {
    this.hideModal();
  }

  createPerson(event) {
    let loading = this.showLoading("Creating...");
    this.api.getToken().then((token:Token) => {
      this.api.createPerson(token, this.person).then((person:Person) => {
        let updates = [];
        for (let contact of this.person.contacts) {
          updates.push(this.updateContact(token, person, contact));
        }
        Promise.all(updates).then((updated:any) => {
          this.database.savePerson(this.organization, person).then((saved:any) => {
            loading.dismiss();
            this.hideModal(person);
          });  
        }, 
        (error:any) => {
          loading.dismiss();
          this.showAlert("Problem Creating Contacts", error);
        });
      }, 
      (error:any) => {
        loading.dismiss();
        this.showAlert("Problem Creating Person", error);
      });
    });
  }

  updatePerson(event) {
    let loading = this.showLoading("Updating...");
    this.api.getToken().then((token:Token) => {
      this.api.updatePerson(token, this.person).then(
        (person:Person) => {
          let updates = [];
          for (let contact of this.person.contacts) {
            updates.push(this.updateContact(token, person, contact));
          }
          Promise.all(updates).then((updated:any) => {
            this.database.savePerson(this.organization, person).then((saved:any) => {
              loading.dismiss();
              this.hideModal(person);
            });  
          }, 
          (error:any) => {
            loading.dismiss();
            this.showAlert("Problem Updating Contacts", error);
          });
        }, 
        (error:any) => {
          loading.dismiss();
          this.showAlert("Problem Updating Person", error);
        });
    });
  }
  
  updateContact(token:Token, person:Person, contact:Contact):Promise<Contact> {
    return new Promise((resolve, reject) => {
      if (contact.contact == null || contact.contact.length == 0) {
        resolve(contact);
      }
      else if (contact.id) {
        this.api.updateContact(token, person, contact).then((updated:Contact) => {
          this.database.saveContact(person, contact).then((saved:any) => {
            resolve(updated);
          });
        }, 
        (error:any) => {
          reject(error);
        });
      }
      else {
        this.api.createContact(token, person, contact).then((created:Contact) => {
          this.database.saveContact(person, contact).then((saved:any) => {
            resolve(created);
          });
        },
        (error:any) => {
          reject(error);
        });
      }
    });
  }
  
  addPhone(event) {
    let contact = new Contact({type: 'phone'});
    this.person.contacts.push(contact)
  }

  addEmail(event) {
    let contact = new Contact({type: 'email'});
    this.person.contacts.push(contact)
  }
  
}
