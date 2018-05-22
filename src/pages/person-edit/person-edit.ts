import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Events, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';
import { Contact } from '../../models/contact';
import { Country } from '../../models/country';
import { Region } from '../../models/region';

import { ApiProvider } from '../../providers/api/api';
import { CameraProvider } from '../../providers/camera/camera';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'PersonEditPage',
  segment: 'people/edit',
  defaultHistory: ['PersonListPage']
})
@Component({
  selector: 'page-person-edit',
  templateUrl: 'person-edit.html',
  providers: [ ApiProvider, StorageProvider, CameraProvider ],
  entryComponents:[ ]
})
export class PersonEditPage extends BasePage {

  organization:Organization = null;
  user:User = null;
  person:Person = null;
  editing:boolean = true;
  profile:boolean = false;
  countryOptions:any = {
    multiple: false,
    title: 'Country Code'
  };
  roleOptions:any = {
    multiple: false,
    title: 'Roles'
  };

  @ViewChild("fileInput")
  fileInput:any = null;
  cameraPresent:boolean = true;
  cameraRollPresent:boolean = true;

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
      protected camera:CameraProvider,
      protected storage:StorageProvider,
      protected events:Events) {
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
    this.user = this.getParameter<User>("user");
    if (this.person) {
      this.editing = true;
    }
    else {
      this.editing = false;
      this.person = new Person({
        name: null,
        description: null,
        role: "responder"
      });
      if (this.organization) {
        this.person.organization_id = this.organization.id;
      }
    }
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

  private loadCamera() {
    this.camera.cameraPresent().then((cameraPresent:boolean) => {
      this.logger.info(this, "loadCamera", "cameraPresent", cameraPresent);
      this.cameraPresent = cameraPresent;
    });
    this.camera.cameraRollPresent().then((cameraRollPresent:boolean) => {
      this.logger.info(this, "loadCamera", "cameraRollPresent", cameraRollPresent);
      this.cameraRollPresent = cameraRollPresent;
    });
  }

  private cancelEdit(event:any) {
    this.logger.info(this, "cancelEdit");
    if (this.editing && this.mobile) {
      let loading = this.showLoading("Canceling...");
      this.storage.getPerson(this.organization, this.person.id).then((person:Person) => {
        this.person.name = person.name;
        this.person.description = person.description;
        this.person.profile_picture = person.profile_picture;
        this.storage.getContacts(this.organization, person).then((contacts:Contact[]) => {
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
        this.storage.savePerson(this.organization, person).then((saved:any) => {
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
          this.storage.savePerson(this.organization, person).then((saved:any) => {
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
          this.storage.savePerson(this.organization, person).then((saved:any) => {
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
            this.storage.saveContact(this.organization, person, updated).then((saved:any) => {
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
            this.storage.saveContact(this.organization, person, created).then((saved:any) => {
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

  private showCameraOptions(event:any) {
    if (this.mobile) {
      let buttons = [];
      if (this.cameraPresent) {
        buttons.push({
          text: 'Take Photo',
          handler: () => {
            this.camera.showCamera().then((photo:any) => {
              this.person.profile_picture = photo;
            },
            (error:any) => {
              this.person.profile_picture = null;
              this.showAlert("Problem Taking Photo", error);
            });
          }
        });
      }
      if (this.cameraRollPresent) {
        buttons.push({
          text: 'Photo Library',
          handler: () => {
            this.camera.showCameraRoll().then((photo:any) => {
              this.person.profile_picture = photo;
            },
            (error:any) => {
              this.person.profile_picture = null;
              this.showAlert("Problem Taking Photo", error);
            });
          }
        });
      }
      buttons.push({
        text: 'Cancel',
        role: 'cancel'
      });
      let actionSheet = this.actionController.create({
        buttons: buttons
      });
      actionSheet.present();
    }
    else if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  private onFileChanged(event:any){
    this.logger.info(this, "onFileChanged", event.target);
    if (event.target.files && event.target.files.length > 0) {
      let reader = new FileReader();
      let file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {
        let imageData = reader.result.split(',')[1];
        if (imageData) {
          this.person.profile_picture = 'data:image/jpeg;base64,' + imageData;
        }
        else {
          this.person.profile_picture = null;
        }
      };
    }
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
            if (this.mobile) {
              let removes = [];
              removes.push(this.storage.removePerson(this.organization, this.person));
              for (let contact of this.person.contacts) {
                removes.push(this.storage.removeContact(this.organization, contact));
              }
              Promise.all(removes).then(removed => {
                loading.dismiss();
                this.showToast("Person removed from organization");
                this.hideModal({
                  removed: true
                });
              });
            }
            else {
              loading.dismiss();
              this.showToast("Person removed from organization");
              this.hideModal({
                removed: true
              });
            }
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
