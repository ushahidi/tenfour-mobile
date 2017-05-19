import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { Contacts } from '@ionic-native/contacts';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Contact } from '../../models/contact';
import { Token } from '../../models/token';

@IonicPage()
@Component({
  selector: 'page-person-import',
  templateUrl: 'person-import.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[  ]
})
export class PersonImportPage extends BasePage {

  organization:Organization = null;
  imports:any[] = [];
  
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
      protected contacts:Contacts) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.imports = [];
    this.contacts.find(['*'], {filter: ""}).then((contacts) => {
      this.logger.info(this, "Contacts", contacts);
      for (let contact of contacts) {
        this.imports.push(contact);
      }
    });
  }
  
  cancelImport(event) {
    this.hideModal();
  }
  
  importContacts(event) {
    this.logger.info(this, "importContacts");
    let loading = this.showLoading("Importing...");
    let imports = [];
    for (let contact of this.imports) {
      if (contact.checked == true) {
        let person = new Person();
        person.organization_id = this.organization.id;
        person.name = contact.name.formatted;
        if (contact.organizations && contact.organizations.length > 0) {
          let organization = contact.organizations[0];
          person.description = `${organization.title}, ${organization.name}`
        }
        else {
          person.description = "";
        }
        for (let phone of contact.phoneNumbers) {
          if (phone.value) {
            let contact = new Contact();
            contact.organization_id = this.organization.id;
            contact.type = "phone";
            contact.contact = phone.value.replace(/\D/g,'');
            if (contact.contact.indexOf("+1") == -1) {
              contact.contact = "+1" + contact.contact;
            }
            person.contacts.push(contact);  
          }
        }
        for (let email of contact.emails) {
          if (email.value && email.value.indexOf("@") != -1) {
            let contact = new Contact();
            contact.organization_id = this.organization.id;
            contact.type = "email";
            contact.contact = email.value;
            person.contacts.push(contact);  
          }
        }
        imports.push(person);
      }
    }
    this.api.getToken().then((token:Token) => {
      let creates = [];
      for (let person of imports) {
        creates.push(this.createPerson(token, person));
      }
      Promise.all(creates).then(created => {
        loading.dismiss();
        this.hideModal();
        this.showToast(`${imports.length} contacts imported`);
      });  
    });
  }
  
  createPerson(token:Token, person:Person):Promise<Person> {
    return new Promise((resolve, reject) => {
      this.api.createPerson(token, person).then((newPerson:Person) => {
        this.database.savePerson(this.organization, newPerson).then((saved:any) => {
          let creates = [];
          for (let contact of person.contacts) {
            creates.push(this.createContact(token, newPerson, contact));
          }
          Promise.all(creates).then(created => {
            resolve(newPerson);
          });
        }, 
        (error: any) => {
          reject(error);
        });
      }, 
      (error: any) => {
        reject(error);
      });
    });
  }
  
  createContact(token:Token, person:Person, contact:Contact):Promise<Contact> {
    return new Promise((resolve, reject) => {
      this.api.createContact(token, person, contact).then((newContact:Contact) => {
        this.database.saveContact(person, newContact).then((saved:any) => {
          resolve(newContact);
        }, 
        (error: any) => {
          reject(error);
        });
      },
      (error:any) => {
        reject(error);
      });  
    });
  }
  
}
