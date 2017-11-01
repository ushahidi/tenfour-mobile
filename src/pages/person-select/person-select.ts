import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Group } from '../../models/group';
import { Person } from '../../models/person';

@IonicPage()
@Component({
  selector: 'page-person-select',
  templateUrl: 'person-select.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[  ]
})
export class PersonSelectPage extends BasePage {

  organization:Organization = null;

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
    let loading = this.showLoading("Loading...");
    this.loadUpdates(true).then((loaded:any) => {
      loading.dismiss();
    });
  }

  loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates", cache);
    return Promise.all([
      this.loadPeople(cache),
      this.loadGroups(cache)]).then(
      (loaded:any) =>{
        this.logger.info(this, "loadUpdates", cache, "Done");
        if (event) {
          event.complete();
        }
      },
      (error:any) => {
        this.logger.error(this, "loadUpdates", cache, error);
        if (event) {
          event.complete();
        }
        this.showToast(error);
      });
  }

  loadPeople(cache:boolean=true):Promise<any> {
    this.logger.info(this, "loadPeople", cache);
    return new Promise((resolve, reject) => {
      if (cache) {
        return this.database.getPeople(this.organization).then((people:Person[]) => {
          this.logger.info(this, "loadPeople", "Database", people);
          if (people && people.length > 1) {
            this.organization.people = people;
            resolve(people);
          }
          else {
            this.loadPeople(false).then((people:Person[]) => {
              this.organization.people = people;
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
        return this.api.getPeople(this.organization).then(
          (people:Person[]) => {
            this.logger.info(this, "loadPeople", "API", people);
            this.organization.people = people;
            let saves = [];
            for (let person of people) {
              saves.push(this.database.savePerson(this.organization, person));
            }
            Promise.all(saves).then(saved => {
              resolve(people);
            });
          },
          (error:any) => {
            reject(error);
          });
      }
    });
  }

  loadGroups(cache:boolean=true):Promise<any> {
    this.logger.info(this, "loadGroups", cache);
    return new Promise((resolve, reject) => {
      if (cache) {
        this.database.getGroups(this.organization).then((groups:Group[]) => {
          this.logger.info(this, "loadGroups", "Database", groups);
          if (groups && groups.length > 0) {
            this.organization.groups = groups;
            resolve(groups);
          }
          else {
            this.loadGroups(false).then((groups:Group[]) => {
              this.organization.groups = groups;
              resolve(groups);
            },
            (error:any) => {
              this.organization.groups = [];
              reject(error);
            });
          }
        });
      }
      else {
        this.api.getGroups(this.organization).then(
          (groups:Group[]) => {
            this.logger.info(this, "loadGroups", "API", groups);
            let saves = [];
            for (let group of groups) {
              saves.push(this.database.saveGroup(this.organization, group));
            }
            Promise.all(saves).then(saved => {
              this.organization.groups = groups;
              this.logger.info(this, "loadGroups", "API", "Done");
              resolve(groups);
            });
          },
          (error:any) => {
            this.organization.groups = [];
            reject(error);
          });
      }
    });
  }

  cancelAdd(event) {
    this.hideModal();
  }

  doneAdd(event) {
    let people = [];
    let groups = [];
    for (let person of this.organization.people) {
      if (person.selected) {
        people.push(person);
      }
    }
    for (let group of this.organization.groups) {
      if (group.selected) {
        groups.push(group);
      }
    }
    this.hideModal({
      people: people,
      groups: groups });
  }

}
