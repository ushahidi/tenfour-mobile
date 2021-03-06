import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, Loading, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';
import { Contact } from '../../models/contact';
import { Country } from '../../models/country';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';
import { ContactsProvider } from '../../providers/contacts/contacts';
import { CountriesProvider } from '../../providers/countries/countries';

@IonicPage({
  name: 'PersonImportPage',
  segment: 'people/import',
  defaultHistory: ['PersonListPage']
})
@Component({
  selector: 'page-person-import',
  templateUrl: 'person-import.html',
  providers: [ ApiProvider, StorageProvider, CountriesProvider, ContactsProvider ]
})
export class PersonImportPage extends BasePrivatePage {

  imports:any[] = [];
  invite:boolean = true;
  invitation:string = "email";
  countryCode:string = "+1";

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
      protected countries:CountriesProvider,
      protected contacts:ContactsProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    let loading = this.showLoading("Loading...");
    Promise.resolve()
      .then(() => { return this.loadOrganization(true); })
      .then(() => { return this.loadUser(true); })
      .then(() => { return this.loadCountries(loading); })
      .then(() => { return this.loadContacts(loading); })
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
    if (this.organization) {
      this.analytics.trackPage(this, {
        organization: this.organization.name
      });
    }
  }

  private cancelImport(event:any) {
    this.logger.info(this, 'cancelImport');
    this.hideModal();
  }

  private loadCountries(loading:Loading):Promise<any> {
    return new Promise((resolve, reject) => {
      if (loading) {
        loading.setContent("Countries...");
      }
      this.countries.getDefaultCountry().then((country:Country) => {
        this.logger.info(this, 'loadCountries', 'Country', country);
        if (country) {
          this.countryCode = `+${country.country_code}`;
        }
        else {
          this.countryCode = "+1";
        }
        resolve();
      },
      (error:any) => {
        this.logger.error(this, 'loadCountries', 'Country', error);
        this.countryCode = "+1";
        resolve();
      });
    });
  }

  private loadContacts(loading:Loading=null, event:any=null):Promise<any> {
    return new Promise((resolve, reject) => {
      if (loading) {
        loading.setContent("Contacts...");
      }
      this.logger.info(this, "loadContacts");
      this.imports = [];
      this.contacts.loadContacts().then((contacts:any[]) => {
        this.imports = contacts;
        if (event) {
          event.complete();
        }
      },
      (error:any) => {
        this.imports = [];
        if (event) {
          event.complete();
        }
      });
    });
  }

  private selectAll(event:any) {
    for (let contact of this.imports) {
      contact.checked = true;
    }
  }

  private importContacts(event:any) {
    this.logger.info(this, "importContacts");
    let loading = this.showLoading("Importing...", true);
    let imports = [];
    for (let contact of this.imports) {
      if (contact.checked == true) {
        this.logger.info(this, "importContacts", "Contact", contact);
        let person = new Person();
        person.organization_id = this.organization.id;
        person.name = contact.name.formatted;
        if (contact.organizations && contact.organizations.length > 0) {
          this.logger.info(this, "importContacts", "Organizations", contact.organizations);
          let organization = contact.organizations[0];
          let description = [];
          if (organization.title && organization.title.length > 0) {
            description.push(organization.title);
          }
          if (organization.name && organization.name.length > 0) {
            description.push(organization.name);
          }
          person.description = description.join(", ");
        }
        else {
          person.description = "";
        }
        if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
          for (let phone of contact.phoneNumbers) {
            this.logger.info(this, "importContacts", "Phone", phone.value);
            if (phone.value) {
              let phoneNumber = phone.value.replace(/\D/g,'');
              if (phoneNumber && phoneNumber.length > 0) {
                let contact = new Contact();
                contact.organization_id = this.organization.id;
                contact.type = "phone";
                if (phoneNumber.indexOf("+") == -1) {
                  contact.contact = this.countryCode + phoneNumber;
                }
                else {
                  contact.contact = phoneNumber;
                }
                person.contacts.push(contact);
              }
            }
          }
        }
        if (contact.emails && contact.emails.length > 0) {
          for (let email of contact.emails) {
            this.logger.info(this, "importContacts", "Email", email.value);
            if (email.value && email.value.indexOf("@") != -1) {
              let contact = new Contact();
              contact.organization_id = this.organization.id;
              contact.type = "email";
              contact.contact = email.value;
              person.contacts.push(contact);
            }
          }
        }
        imports.push(person);
      }
    }
    let creates = [];
    for (let person of imports) {
      creates.push(this.createPerson(person));
    }
    return Promise.all(creates).then(created => {
      loading.dismiss();
      this.hideModal({ people: imports });
      this.showToast(`${imports.length} contacts imported`);
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Importing Contacts", error);
    });
  }

  private createPerson(person:Person):Promise<Person> {
    return new Promise((resolve, reject) => {
      this.api.createPerson(this.organization, person).then((newPerson:Person) => {
        this.storage.savePerson(this.organization, newPerson).then((saved:any) => {
          let creates = [];
          for (let contact of person.contacts) {
            creates.push(this.createContact(newPerson, contact));
          }
          Promise.all(creates).then((created:any) => {
            if (this.invite == true && person.hasEmails()) {
              this.api.invitePerson(this.organization, person).then((invited:Person) => {
                resolve(newPerson);
              },
              (error:any) => {
                reject(error);
              });
            }
            else {
              resolve(newPerson);
            }
          },
          (error:any) => {
            reject(error);
          });
        },
        (error:any) => {
          reject(error);
        });
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  private createContact(person:Person, contact:Contact):Promise<Contact> {
    return new Promise((resolve, reject) => {
      this.api.createContact(this.organization, person, contact).then((newContact:Contact) => {
        if (this.mobile) {
          this.storage.saveContact(this.organization, person, newContact).then((saved:any) => {
            resolve(newContact);
          },
          (error:any) => {
            reject(error);
          });
        }
        else {
          resolve(newContact);
        }
      },
      (error:any) => {
        reject(error);
      });
    });
  }

}
