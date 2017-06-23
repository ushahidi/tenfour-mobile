import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { Sim } from '@ionic-native/sim';
import { Contacts } from '@ionic-native/contacts';
import { IsDebug } from '@ionic-native/is-debug';
import { StatusBar } from '@ionic-native/status-bar';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiService } from '../../providers/api-service';
import { CountryService } from '../../providers/country-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Contact } from '../../models/contact';
import { Country } from '../../models/country';

@IonicPage()
@Component({
  selector: 'page-person-import',
  templateUrl: 'person-import.html',
  providers: [ ApiService, DatabaseService, CountryService ],
  entryComponents:[  ]
})
export class PersonImportPage extends BasePage {

  organization:Organization = null;
  imports:any[] = [];
  invite:boolean = true;
  invitation:string = "email";
  countryCode:string = "+1";
  debug:boolean = false;

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
      protected countries:CountryService,
      protected contacts:Contacts,
      protected isDebug:IsDebug,
      protected statusBar:StatusBar,
      protected sim:Sim) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.statusBar.overlaysWebView(false);
    let loading = this.showLoading("Loading...");
    Promise.resolve()
      .then(() => { return this.loadDebug(); })
      .then(() => { return this.loadCountry(); })
      .then(() => { return this.loadContacts(); })
      .then(() => {
        loading.dismiss();
      })
      .catch((error) => {
        loading.dismiss();
        this.showToast(error);
      });
  }

  ionViewWillLeave() {
    super.ionViewWillLeave();
    this.statusBar.overlaysWebView(true);
  }

  cancelImport(event:any) {
    this.hideModal();
  }

  loadDebug():Promise<any> {
    return new Promise((resolve, reject) => {
      this.platform.ready().then(() => {
        this.isDebug.getIsDebug()
          .then((isDebug:boolean) => {
            this.debug = isDebug;
            resolve();
          })
          .catch((error: any) => {
            this.debug = false;
            resolve();
          });
      });
    });
  }

  loadCountry():Promise<any> {
    return new Promise((resolve, reject) => {
      this.sim.getSimInfo().then(
        (info:any) => {
          this.logger.info(this, 'loadCountry', 'SIM', info);
          this.countries.getCode(info.countryCode).then(
            (country:Country) => {
              this.logger.info(this, 'loadCountry', 'Country', country);
              if (country) {
                this.countryCode == country.dial_code;
              }
              else {
                this.countryCode = "+1";
              }
              resolve();
            },
            (error:any) => {
              this.logger.error(this, 'loadCountry', 'Country', error);
              this.countryCode = "+1";
              resolve();
            });
        },
        (error:any) => {
          this.logger.error(this, 'loadCountry', 'SIM', error);
          this.countryCode = "+1";
          resolve();
        }
      );
    });
  }

  loadContacts(event:any=null):Promise<any> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadContacts");
      this.imports = [];
      if (this.debug) {
        this.imports.push(this.defaultContact());
      }
      this.contacts.find(['*']).then((contacts:any[]) => {
        let sorted = contacts.sort(function(a, b) {
          var givenA = a.name.givenName;
          var givenB = b.name.givenName;
          var familyA = a.name.familyName;
          var familyB = b.name.familyName;
          if (familyA === familyB) {
            return (givenA < givenB) ? -1 : (givenA > givenB) ? 1 : 0;
          }
          else {
            return (familyA < familyB) ? -1 : (familyA > familyB) ? 1 : 0;
          }
        });
        for (let contact of sorted) {
          this.logger.info(this, "loadContacts", "Contact", contact);
          this.imports.push(contact);
        }
        if (event) {
          event.complete();
        }
        resolve();
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  selectAll(event:any) {
    for (let contact of this.imports) {
      contact.checked = true;
    }
  }

  importContacts(event:any) {
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
            let phoneNumber = phone.value.replace(/\D/g,'');
            if (phoneNumber) {
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
    let creates = [];
    for (let person of imports) {
      creates.push(this.createPerson(person));
    }
    return Promise.all(creates).then(created => {
      loading.dismiss();
      this.hideModal();
      this.showToast(`${imports.length} contacts imported`);
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Importing Contacts", error);
    });
  }

  createPerson(person:Person):Promise<Person> {
    return new Promise((resolve, reject) => {
      this.api.createPerson(this.organization, person).then((newPerson:Person) => {
        this.database.savePerson(this.organization, newPerson).then((saved:any) => {
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

  createContact(person:Person, contact:Contact):Promise<Contact> {
    return new Promise((resolve, reject) => {
      this.api.createContact(this.organization, person, contact).then((newContact:Contact) => {
        this.database.saveContact(person, newContact).then((saved:any) => {
          resolve(newContact);
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

  defaultContact():any {
    return {
      "id":2,
      "rawId":null,
      "displayName":null,
      "note":null,
      "photos":null,
      "categories":null,
      "urls":null,
      "ims":null,
      "nickname":null,
      "birthday":"1978-01-20T12:00:00.000Z",
      "name":{
        "givenName":"Dale",
        "honorificSuffix":null,
        "formatted":"Dale Zak",
        "middleName":null,
        "familyName":"Zak",
        "honorificPrefix":null},
      "phoneNumbers":[
        {"value":"(306) 341-3644","pref":false,"id":0,"type":"mobile"}],
      "emails":[
        {"value":"dalezak@gmail.com","pref":false,"id":0,"type":"home"},
        {"value":"dale@ushahidi.com","pref":false,"id":1,"type":"work"}],
      "addresses":[
        {"pref":"false","locality":"Saskatoon","region":"CA","id":0,"postalCode":"S7N0E1","country":"Canada","type":"home","streetAddress":"413 10th Street East"}],
      "organizations":[
        {"pref":"false","title":"Producer","name":"Creative Consulting","department":null,"type":null}]
      }
  }

}
