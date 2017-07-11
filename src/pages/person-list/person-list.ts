import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { PersonAddPage } from '../../pages/person-add/person-add';
import { PersonDetailsPage } from '../../pages/person-details/person-details';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';

@IonicPage()
@Component({
  selector: 'page-person-list',
  templateUrl: 'person-list.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[ PersonAddPage, PersonDetailsPage ]
})
export class PersonListPage extends BasePage {

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
      protected database:DatabaseService) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.person = this.getParameter<Person>("person");
    this.loadPeople(null, true);
  }

  loadPeople(event:any, cache:boolean=true) {
    if (cache) {
      return this.database.getPeople(this.organization).then((people:Person[]) => {
        if (people && people.length > 1) {
          this.organization.people = people;
          if (event) {
            event.complete();
          }
        }
        else {
          this.loadPeople(event, false);
        }
      });
    }
    else {
      return this.api.getPeople(this.organization).then(
        (people:Person[]) => {
          this.organization.people = people;
          let saves = [];
          for (let person of people) {
            saves.push(this.database.savePerson(this.organization, person));
          }
          Promise.all(saves).then(saved => {
            if (event) {
              event.complete();
            }
          });
        },
        (error:any) => {
          if (event) {
            event.complete();
          }
          this.showToast(error);
        });
    }
  }

  addPeople(event:any) {
    this.logger.info(this, "addPeople");
    this.showModal(PersonAddPage,
      { organization: this.organization });
  }

  showPerson(event:any, person:Person) {
    this.logger.info(this, "showPerson");
    this.showPage(PersonDetailsPage,
      { organization: this.organization,
        person: person })
  }

  removePerson(person:Person) {
    this.logger.info(this, "removePerson", person);
    let loading = this.showLoading("Removing...");
    this.api.deletePerson(this.organization, person).then((deleted:any) => {
      let removes = [];
      removes.push(this.database.removePerson(person));
      for (let contact of person.contacts) {
        removes.push(this.database.removeContact(contact));
      }
      Promise.all(removes).then(removed => {
        let index = this.organization.people.indexOf(person);
        if (index > -1) {
          this.organization.people.splice(index, 1);
        }
        loading.dismiss();
      });
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Removing Person", error);
    });
  }

}
