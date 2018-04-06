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
  limit:number = 20;
  offset:number = 0;

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

  ionViewDidLoad() {
    super.ionViewDidLoad();
    this.organization = this.getParameter<Organization>("organization");
    this.person = this.getParameter<Person>("person");
    let loading = this.showLoading("Loading...");
    this.loadPeople(true).then((finished:any) => {
      loading.dismiss();
    },
    (error:any) => {
      loading.dismiss();
    });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.trackPage({
      organization: this.organization.name
    });
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    this.loading = true;
    return Promise.all([this.loadPeople(cache)]).then(
      (loaded:any) =>{
        this.logger.info(this, "loadUpdates", "Done");
        if (event) {
          event.complete();
        }
        this.loading = false;
      },
      (error:any) => {
        if (event) {
          event.complete();
        }
        this.loading = false;
        this.showToast(error);
      });
  }

  private loadMore(event:any) {
    return new Promise((resolve, reject) => {
      this.offset = this.offset + this.limit;
      this.logger.info(this, "loadMore", "Limit", this.limit, "Offset", this.offset);
      this.api.getPeople(this.organization, this.limit, this.offset).then((people:Person[]) => {
        let saves = [];
        for (let person of people) {
          saves.push(this.database.savePerson(this.organization, person));
        }
        Promise.all(saves).then(saved => {
          this.organization.people = [...this.organization.people, ...people];
          if (event) {
            event.complete();
          }
          this.logger.info(this, "loadMore", "Limit", this.limit, "Offset", this.offset, "Total", this.organization.people.length);
          resolve(this.organization.people);
        });
      },
      (error:any) => {
        this.logger.error(this, "loadMore", "Limit", this.limit, "Offset", this.offset, "Error", error);
        if (event) {
          event.complete();
        }
        resolve(this.organization.people);
      });
    });
  }

  private loadPeople(cache:boolean=true) {
    return new Promise((resolve, reject) => {
      this.offset = 0;
      if (cache) {
        this.database.getPeople(this.organization, null, this.limit, this.offset).then((people:Person[]) => {
          if (people && people.length > 1) {
            this.organization.people = people;
            this.loading = false;
            resolve(people);
          }
          else {
            this.loadPeople(false).then((people:Person[]) => {
              resolve(people);
            },
            (error:any) => {
              this.organization.people = [];
              reject(error);
            });
          }
        });
      }
      else {
        this.api.getPeople(this.organization).then((people:Person[]) => {
          let saves = [];
          for (let person of people) {
            saves.push(this.database.savePerson(this.organization, person));
          }
          Promise.all(saves).then(saved => {
            this.database.getPeople(this.organization, null, this.limit, this.offset).then((_people:Person[]) => {
              this.organization.people = _people;
              this.loading = false;
              resolve(_people);
            });
          });
        },
        (error:any) => {
          this.organization.people = [];
          this.loading = false;
          this.showToast(error);
          reject(error);
        });
      }
    });
  }

  private addPeople(event:any) {
    this.logger.info(this, "addPeople");
    this.showModal(PersonAddPage,
      { organization: this.organization,
        person: this.person,
        user: this.person });
  }

  private showPerson(event:any, person:Person) {
    this.logger.info(this, "showPerson");
    this.showPage(PersonDetailsPage,
      { organization: this.organization,
        person: person,
        user: this.person })
  }

  private removePerson(person:Person) {
    this.logger.info(this, "removePerson", person);
    let loading = this.showLoading("Removing...");
    this.api.deletePerson(this.organization, person).then((deleted:any) => {
      let removes = [];
      removes.push(this.database.removePerson(this.organization, person));
      for (let contact of person.contacts) {
        removes.push(this.database.removeContact(this.organization, contact));
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
