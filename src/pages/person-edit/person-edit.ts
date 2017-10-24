import { Component, NgZone } from '@angular/core';
import { IonicPage, Events, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';
import { CountryService } from '../../providers/country-service';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Contact } from '../../models/contact';
import { Country } from '../../models/country';
import { Region } from '../../models/region';

@IonicPage()
@Component({
  selector: 'page-person-edit',
  templateUrl: 'person-edit.html',
  providers: [ ApiService, DatabaseService, CountryService ],
  entryComponents:[  ]
})
export class PersonEditPage extends BasePage {

  organization:Organization = null;
  person:Person = null;
  editing:boolean = true;
  cameraPresent: boolean = true;
  selectOptions:any = {};
  countryCodes:any = [];
  selectType:string = "action-sheet";

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
      protected countryService:CountryService,
      protected events:Events,
      protected camera:Camera,
      protected statusBar:StatusBar,
      protected diagnostic:Diagnostic) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
    this.loadCamera();
    this.selectOptions = {
      multiple: false,
      title: 'Country Code'
    }
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.person = this.getParameter<Person>("person");
    if (this.person) {
      this.editing = true;
    }
    else {
      this.statusBar.overlaysWebView(false);
      this.editing = false;
      this.person = new Person({
        name: null,
        description: null,
        organization_id: this.organization.id
      });
    }
    this.loadCountryCodes(true).then((countryCodes:number[]) => {
      this.countryCodes = countryCodes;
    },
    (error:any) => {
      this.countryCodes = [1];
    });
  }

  ionViewWillLeave() {
    super.ionViewWillLeave();
    if (this.editing == false) {
      this.statusBar.overlaysWebView(true);
    }
  }

  loadCountryCodes(cache:boolean=true):Promise<number[]> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadRegions");
      if (cache) {
        this.database.getCountries(this.organization).then((countries:Country[]) => {
          if (countries && countries.length > 0) {
            let countryCodes = [];
            for (let country of countries) {
              if (country.selected && countryCodes.indexOf(country.country_code) == -1) {
                countryCodes.push(country.country_code);
              }
            }
            resolve(countryCodes);
          }
          else {
            this.loadCountryCodes(false).then((countryCodes:number[]) => {
              resolve(countryCodes);
            },
            (error:any) => {
              reject(error);
            });
          }
        });
      }
      else {
        this.api.getRegions(this.organization).then((regions:Region[]) => {
          let codes = regions.map(region => region.code);
          this.countryService.getCountries(codes).then((countries:Country[]) => {
            let saves = [];
            for (let country of countries) {
              if (this.organization.regions) {
                let codes = this.organization.regions.split(",");
                country.selected = codes.indexOf(country.code) != -1;
              }
              else {
                country.selected = false;
              }
              saves.push(this.database.saveCountry(this.organization, country));
            }
            Promise.all(saves).then(saved => {
              let countryCodes = [];
              for (let country of countries) {
                if (country.selected && countryCodes.indexOf(country.country_code) == -1) {
                  countryCodes.push(country.country_code);
                }
              }
              resolve(countryCodes);
            });
          });
        },
        (error:any) => {
          reject(error);
        });
      }
    });
  }

  loadCamera() {
    return this.diagnostic.isCameraPresent().then(
      (cameraPresent:boolean) => {
        this.logger.info(this, "loadCamera", "isCameraPresent", cameraPresent);
        this.cameraPresent = cameraPresent;
      },
      (error:any) => {
        this.logger.error(this, "loadCamera", "isCameraPresent", error);
        this.cameraPresent = false;
      });
  }

  cancelEdit(event) {
    this.hideModal();
  }

  createPerson(event) {
    let loading = this.showLoading("Creating...");
    this.api.createPerson(this.organization, this.person).then((person:Person) => {
      let updates = [];
      for (let contact of this.person.contacts) {
        updates.push(this.updateContact(this.organization, person, contact));
      }
      Promise.all(updates).then((updated:any) => {
        this.database.savePerson(this.organization, person).then((saved:any) => {
          loading.dismiss();
          this.hideModal({ person: person });
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
  }

  updatePerson(event) {
    let loading = this.showLoading("Updating...");
    this.api.updatePerson(this.organization, this.person).then(
      (person:Person) => {
        let updates = [];
        for (let contact of this.person.contacts) {
          updates.push(this.updateContact(this.organization, person, contact));
        }
        Promise.all(updates).then((updated:any) => {
          this.database.savePerson(this.organization, person).then((saved:any) => {
            loading.dismiss();
            this.hideModal({ person: person });
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
  }

  updateContact(organization:Organization, person:Person, contact:Contact):Promise<Contact> {
    return new Promise((resolve, reject) => {
      if (contact.contact == null || contact.contact.length == 0) {
        resolve(contact);
      }
      else if (contact.id) {
        this.api.updateContact(organization, person, contact).then((updated:Contact) => {
          this.database.saveContact(person, contact).then((saved:any) => {
            resolve(updated);
          });
        },
        (error:any) => {
          reject(error);
        });
      }
      else {
        this.api.createContact(organization, person, contact).then((created:Contact) => {
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
    let countryCode = this.countryCodes && this.countryCodes.length > 0 ? this.countryCodes[0] : 1;
    let contact = new Contact({
      type: 'phone',
      country_code: countryCode});
    this.person.contacts.push(contact)
  }

  addEmail(event) {
    let contact = new Contact({type: 'email'});
    this.person.contacts.push(contact)
  }

  showCameraOptions() {
    let buttons = [];
    if (this.cameraPresent) {
      buttons.push({
        text: 'Take Photo',
        handler: () => {
          this.showCamera();
        }
      });
    }
    buttons.push({
      text: 'Photo Library',
      handler: () => {
        this.showCameraRoll();
      }
    });
    buttons.push({
      text: 'Cancel',
      role: 'cancel'
    });
    let actionSheet = this.actionController.create({
      buttons: buttons
    });
    actionSheet.present();
  }

  showCamera() {
    this.logger.info(this, "showCamera");
    let options:CameraOptions = {
      mediaType: this.camera.MediaType.PICTURE,
      encodingType: this.camera.EncodingType.JPEG,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.CAMERA
    }
    this.camera.getPicture(options).then((imageData:any) => {
      this.logger.info(this, "showCamera", "Captured");
      this.person.profile_picture = 'data:image/jpeg;base64,' + imageData;
    },
    (error:any) => {
      this.logger.error(this, "showCamera", error);
      this.showAlert("Problem Taking Photo", error);
    });
  }

  showCameraRoll() {
    this.logger.info(this, "showCameraRoll");
    let options:CameraOptions = {
      mediaType: this.camera.MediaType.PICTURE,
      encodingType: this.camera.EncodingType.JPEG,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
    }
    this.camera.getPicture(options).then((imageData:any) => {
      this.logger.info(this, "showCameraRoll", "Selected");
      if (imageData) {
        this.person.profile_picture = 'data:image/jpeg;base64,' + imageData;
      }
      else {
        this.person.profile_picture = null;
      }
    },
    (error:any) => {
      this.logger.error(this, "showCameraRoll", error);
      this.showAlert("Problem Selecting Photo", error);
    });
  }

  deletePerson(event:any) {
    let loading = this.showLoading("Removing...");
    this.api.deletePerson(this.organization, this.person).then((deleted:any) => {
      let removes = [];
      removes.push(this.database.removePerson(this.person));
      for (let contact of this.person.contacts) {
        removes.push(this.database.removeContact(contact));
      }
      Promise.all(removes).then(removed => {
        loading.dismiss();
        this.showToast("Person removed from organization");
        this.hideModal({deleted: true});
      });
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Removing Person", error);
    });
  }

  phoneChange(contact:Contact) {
    this.logger.info(this, "phoneChange", contact.country_code, contact.national_number, contact.contact);
    contact.contact = `+${ contact.country_code}${contact.national_number}`;
  }

}
