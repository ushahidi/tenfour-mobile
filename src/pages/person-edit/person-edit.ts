import { Component, NgZone } from '@angular/core';
import { IonicPage, Events, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { Diagnostic } from '@ionic-native/diagnostic';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Contact } from '../../models/contact';

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
  cameraPresent: boolean = true;

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
      protected diagnostic:Diagnostic) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
    this.diagnostic.isCameraPresent().then((cameraPresent:boolean) => {
      this.logger.info(this, "isCameraPresent", cameraPresent);
      this.cameraPresent = cameraPresent;
    })
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
    this.api.createPerson(this.person).then((person:Person) => {
      let updates = [];
      for (let contact of this.person.contacts) {
        updates.push(this.updateContact(person, contact));
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
  }

  updatePerson(event) {
    let loading = this.showLoading("Updating...");
    this.api.updatePerson(this.person).then(
      (person:Person) => {
        let updates = [];
        for (let contact of this.person.contacts) {
          updates.push(this.updateContact(person, contact));
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
  }

  updateContact(person:Person, contact:Contact):Promise<Contact> {
    return new Promise((resolve, reject) => {
      if (contact.contact == null || contact.contact.length == 0) {
        resolve(contact);
      }
      else if (contact.id) {
        this.api.updateContact(person, contact).then((updated:Contact) => {
          this.database.saveContact(person, contact).then((saved:any) => {
            resolve(updated);
          });
        },
        (error:any) => {
          reject(error);
        });
      }
      else {
        this.api.createContact(person, contact).then((created:Contact) => {
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
      this.person.profile_picture = 'data:image/jpeg;base64,' + imageData;
    },
    (error:any) => {
      this.logger.error(this, "showCameraRoll", error);
      this.showAlert("Problem Selecting Photo", error);
    });
  }

}
