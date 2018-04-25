import { Component, NgZone } from '@angular/core';
import { IonicPage, Events, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Contact } from '../../models/contact';
import { Country } from '../../models/country';
import { Region } from '../../models/region';

@IonicPage()
@Component({
  selector: 'page-person-edit',
  templateUrl: 'person-edit.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[ ]
})
export class PersonEditPage extends BasePage {

  organization:Organization = null;
  user:Person = null;
  person:Person = null;
  editing:boolean = true;
  profile:boolean = false;
  cameraPresent:boolean = true;
  countryOptions:any = {
    multiple: false,
    title: 'Country Code'
  };
  roleOptions:any = {
    multiple: false,
    title: 'Roles'
  };

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
      protected events:Events,
      protected camera:Camera,
      protected statusBar:StatusBar,
      protected diagnostic:Diagnostic) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
    this.loadCamera();
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.person = this.getParameter<Person>("person");
    this.user = this.getParameter<Person>("user");
    if (this.person) {
      this.editing = true;
    }
    else {
      this.editing = false;
      this.person = new Person({
        name: null,
        description: null,
        role: "responder",
        organization_id: this.organization.id
      });
    }
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.trackPage({
      organization: this.organization.name,
      person: this.person.name
    });
  }

  private cancelEdit(event:any) {
    this.logger.info(this, "cancelEdit");
    if (this.editing) {
      let loading = this.showLoading("Canceling...");
      this.database.getPerson(this.organization, this.person.id).then((person:Person) => {
        this.person.name = person.name;
        this.person.description = person.description;
        this.person.profile_picture = person.profile_picture;
        this.database.getContacts(this.organization, person).then((contacts:Contact[]) => {
          for (let contact of this.person.contacts) {
            let _contact = contacts.filter(_contact => _contact.id == contact.id);
            if (_contact && _contact.length > 0) {
              contact.contact = _contact[0].contact;
            }
          }
          loading.dismiss();
          this.hideModal({
            canceled: true
          });
        });
      });
    }
    else {
      this.hideModal({
        canceled: true
      });
    }
  }

  private savePersonAndContacts(activity:string, event:any) {
    let loading = this.showLoading(`${activity}...`);
    this.savePerson(this.organization, this.person).then((person:Person) => {
      let contacts = [];
      for (let contact of this.person.getPhones()) {
        contacts.push(this.saveContact(this.organization, person, contact));
      }
      for (let contact of this.person.getEmails()) {
        contacts.push(this.saveContact(this.organization, person, contact));
      }
      Promise.all(contacts).then((updated:any) => {
        this.database.savePerson(this.organization, person).then((saved:any) => {
          loading.dismiss();
          this.hideModal({
            person: person
          });
        });
      },
      (error:any) => {
        loading.dismiss();
        this.showAlert(`Problem ${activity} Contacts`, error);
      });
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert(`Problem ${activity} Person`, error);
    });
  }

  private savePerson(organization:Organization, person:Person):Promise<Person> {
    return new Promise((resolve, reject) => {
      if (person.id) {
        this.logger.info(this, "savePerson", "Update", person);
        this.api.updatePerson(this.organization, person).then((person:Person) => {
          this.database.savePerson(this.organization, person).then((saved:any) => {
            resolve(person);
          });
        },
        (error:any) => {
          reject(error);
        });
      }
      else {
        this.logger.info(this, "savePerson", "Create", person);
        this.api.createPerson(this.organization, person).then((person:Person) => {
          this.person.id = person.id;
          this.database.savePerson(this.organization, person).then((saved:any) => {
            resolve(person);
          });
        },
        (error:any) => {
          reject(error);
        });
      }
    });
  }

  private saveContact(organization:Organization, person:Person, contact:Contact):Promise<Contact> {
    return new Promise((resolve, reject) => {
      if (contact.id) {
        this.logger.info(this, "saveContact", "Update", contact);
        if (contact.type == 'phone' && contact.national_number && contact.national_number.length > 0) {
          contact.contact = `+${contact.country_code}${contact.national_number}`;
        }
        if (contact.contact && contact.contact.length > 0) {
          this.api.updateContact(organization, person, contact).then((updated:Contact) => {
            this.database.saveContact(this.organization, person, updated).then((saved:any) => {
              resolve(updated);
            });
          },
          (error:any) => {
            reject(error);
          });
        }
        else {
          resolve(null);
        }
      }
      else {
        this.logger.info(this, "saveContact", "Create", contact);
        if (contact.type == 'phone' && contact.national_number && contact.national_number.length > 0) {
          contact.contact = `+${contact.country_code}${contact.national_number}`;
        }
        if (contact.contact && contact.contact.length > 0) {
          this.api.createContact(organization, person, contact).then((created:Contact) => {
            contact.id = created.id;
            this.database.saveContact(this.organization, person, created).then((saved:any) => {
              resolve(created);
            });
          },
          (error:any) => {
            reject(error);
          });
        }
        else {
          resolve(null);
        }
      }
    });
  }

  private addPhone(event:any) {
    let countryCodes = this.organization.countryCodes();
    let countryCode = countryCodes && countryCodes.length > 0 ? countryCodes[0] : 1;
    let contact = new Contact({
      type: 'phone',
      country_code: countryCode
    });
    this.person.contacts.push(contact)
  }

  private addEmail(event:any) {
    let contact = new Contact({type: 'email'});
    this.person.contacts.push(contact)
  }

  private showCameraOptions() {
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

  private loadCamera() {
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

  private showCamera() {
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

  private showCameraRoll() {
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

  private addRole(event:any) {
    this.logger.info(this, "addRole");
  }

  private removePerson(event:any) {
    let buttons = [
      {
        text: 'Remove',
        handler: () => {
          let loading = this.showLoading("Removing...");
          this.api.deletePerson(this.organization, this.person).then((deleted:any) => {
            let removes = [];
            removes.push(this.database.removePerson(this.organization, this.person));
            for (let contact of this.person.contacts) {
              removes.push(this.database.removeContact(this.organization, contact));
            }
            Promise.all(removes).then(removed => {
              loading.dismiss();
              this.showToast("Person removed from organization");
              this.hideModal({
                removed: true
              });
            });
          },
          (error:any) => {
            loading.dismiss();
            this.showAlert("Problem Removing Person", error);
          });
        }
      },
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          this.logger.info(this, "removePerson", "Cancelled");
        }
      }
    ];
    this.showConfirm("Remove Person", "Are you sure you want to remove this person?", buttons);
  }

  private deleteAccount(event:any) {
    let buttons = [
      {
        text: 'Delete',
        handler: () => {
          let loading = this.showLoading("Deleting...");
          this.api.deletePerson(this.organization, this.person).then((deleted:any) => {
            loading.dismiss();
            this.showToast("Your account has been deleted");
            this.hideModal({
              deleted: true
            });
          },
          (error:any) => {
            loading.dismiss();
            this.showAlert("Problem Deleting Acount", error);
          });
        }
      },
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          this.logger.info(this, "deleteAccount", "Cancelled");
        }
      }
    ];
    this.showConfirm("Delete Account", "Are you sure you want to delete your account?", buttons);
  }

  private onKeyPress(event:any) {
    if (event.keyCode == 13) {
      this.logger.info(this, "onKeyPress", "Enter");
      this.hideKeyboard();
      return false;
    }
    else {
      return true;
    }
  }

}
