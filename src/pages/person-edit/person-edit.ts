import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';
import { PersonSelectPage } from '../../pages/person-select/person-select';

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
  entryComponents:[ PersonSelectPage ]
})
export class PersonEditPage extends BasePrivatePage {

  person:Person = null;
  editing:boolean = true;
  profile:boolean = false;
  countryOptions:any = {
    multiple: false,
    title: 'Country Code'
  };
  countryCodes:any = [];
  roleOptions:any = {
    multiple: false,
    title: 'Roles'
  };
  groupsOptions:any = {
    multiple: false,
    title: 'Groups'
  };
  loading:boolean = false;

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
      protected storage:StorageProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
    this.profile = this.getParameter<boolean>("profile");
    let loading = this.showLoading("Loading...");
    this.loadUpdates(true).then((loaded:any) => {
      loading.dismiss();
    });
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    if (this.organization && this.person) {
      this.analytics.trackPage(this, {
        organization: this.organization.name,
        person: this.person.name
      });
    }
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    this.loading = true;

    return new Promise((resolve, reject) => {
      return this.loadOrganization(cache)
        .then((org) => { return this.loadUser(cache); })
        .then((user) => { return this.loadPerson(cache); })
        .then((person) => { return this.loadRegions(cache); })
        .then((regions) => { return this.loadCamera(); })
        .then(() => {
          this.logger.info(this, "loadUpdates", "Loaded");
          if (event) {
            event.complete();
          }
          this.loading = false;
          resolve();
        })
        .catch((error:any) => {
          this.logger.error(this, "loadUpdates", "Failed", error);
          if (event) {
            event.complete();
          }
          this.loading = false;
          this.showToast(error);
          reject(error);
        });
    });
  }

  private loadRegions(cache:boolean=true):Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (cache) {
        this.storage.getCountries(this.organization).then((countries:Country[]) => {
          if (countries && countries.length > 0) {
            this.countryCodes = countries
              .map(country => country.country_code)
              .filter((v, i, a) => a.indexOf(v) === i);
            resolve();
          }
          else {
            this.loadRegions(false).then(resolve);
          }
        });
      }
      else {
        this.api.getRegions(this.organization).then((regions:Region[]) => {
          this.countryCodes = regions
            .map(region => region.country_code)
            .filter((v, i, a) => a.indexOf(v) === i);
          resolve();
        });
      }
    });
  }

  protected loadPerson(cache:boolean=true):Promise<Person> {
    return new Promise((resolve, reject) => {
      if (cache && this.person) {
        resolve(this.person);
      }
      else if (cache && this.hasParameter("person")){
        this.editing = true;
        this.person = this.getParameter<Person>("person");
        resolve(this.person);
      }
      else if (this.hasParameter("person_id")) {
        this.editing = true;
        let personId = this.getParameter<number>("person_id");
        this.promiseFallback(cache,
          this.storage.getPerson(this.organization, personId),
          this.api.getPerson(this.organization, personId)).then((person:Person) => {
            this.person = person;
            resolve(person);
        },
        (error:any) => {
          resolve(null);
        });
      }
      else {
        this.editing = false;
        this.person = new Person({
          organization_id: this.organization.id,
          name: null,
          description: null,
          role: "responder"
        });
        resolve(this.person);
      }
    });
  }

  private loadCamera():Promise<boolean> {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.camera.cameraPresent(),
        this.camera.cameraRollPresent()]).then((results:boolean[]) => {
          this.logger.info(this, "loadCamera", "cameraPresent", results[0]);
          this.cameraPresent = results[0];
          this.logger.info(this, "loadCamera", "cameraRollPresent", results[1]);
          this.cameraRollPresent = results[1];
          resolve(true);
        },
        (error:any) => {
          this.cameraPresent = false;
          this.cameraRollPresent = false;
          resolve(false);
        });
    });
  }

  private cancelEdit(event:any) {
    this.logger.info(this, "cancelEdit");
    if (this.editing && this.mobile) {
      let loading = this.showLoading("Canceling...", true);
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
    let loading = this.showLoading(`${activity}...`, true);
    this.savePerson(this.organization, this.person).then((person:Person) => {
      let contacts = [];
      for (let contact of this.person.getPhones()) {
        contacts.push(this.saveContact(this.organization, person, contact));
      }
      for (let contact of this.person.getEmails()) {
        contacts.push(this.saveContact(this.organization, person, contact));
      }
      for (let contact of this.person.getAddresses()) {
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

  private addPhone(event:any=null) {
    let countryCodes = this.organization.countryCodes();
    let countryCode = countryCodes && countryCodes.length > 0 ? countryCodes[0] : 1;
    let contact = new Contact({
      type: 'phone',
      country_code: countryCode
    });
    this.person.contacts.push(contact)
  }

  private addEmail(event:any=null) {
    let contact = new Contact({type: 'email'});
    this.person.contacts.push(contact);
  }

  private addAddress(event:any=null) {
    let contact = new Contact({type: 'address'});
    this.person.contacts.push(contact);
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
          let loading = this.showLoading("Removing...", true);
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
          let loading = this.showLoading("Deleting...", true);
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
    if (this.isKeyReturn(event)) {
      this.logger.info(this, "onKeyPress", "Enter");
      this.hideKeyboard();
      return false;
    }
    else {
      return true;
    }
  }

  private showPeopleSelect(event:any=null) {
    let modal = this.showModal(PersonSelectPage, {
      organization: this.organization,
      user: this.user,
      groups: this.person.groups,
      show_groups: true,
      show_people: false
    });
    modal.onDidDismiss(data => {
      this.logger.info(this, "showPeopleSelect", data);
       if (data && data.groups) {
         this.person.groups = data.groups;
       }
     });
  }

}
