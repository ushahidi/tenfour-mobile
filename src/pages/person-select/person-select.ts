import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiProvider } from '../../providers/api/api';
import { DatabaseProvider } from '../../providers/database/database';

import { Organization } from '../../models/organization';
import { Group } from '../../models/group';
import { Person } from '../../models/person';

@IonicPage({
  name: 'PersonSelectPage',
  segment: 'people/select'
})
@Component({
  selector: 'page-person-select',
  templateUrl: 'person-select.html',
  providers: [ ApiProvider, DatabaseProvider ],
  entryComponents:[ ]
})
export class PersonSelectPage extends BasePage {

  organization:Organization = null;
  people:Person[] = null;
  groups:Group[] = null;
  show_groups:boolean = true;
  limit:number = 25;
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
      protected api:ApiProvider,
      protected database:DatabaseProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.groups = this.getParameter<Group[]>("groups");
    this.people = this.getParameter<Person[]>("people");
    this.show_groups = this.getParameter<boolean>("show_groups");
    let loading = this.showLoading("Loading...");
    this.loadUpdates(true).then((loaded:any) => {
      loading.dismiss();
    });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    if (this.organization) {
      this.trackPage({
        organization: this.organization.name
      });
    }
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates", cache);
    this.offset = 0;
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

  private loadPeople(cache:boolean=true):Promise<any> {
    this.logger.info(this, "loadPeople", cache);
    return new Promise((resolve, reject) => {
      if (cache && this.mobile) {
        this.database.getPeople(this.organization, null, this.limit, this.offset).then((people:Person[]) => {
          this.logger.info(this, "loadPeople", "Limit", this.limit, "Offset", this.offset, people);
          if (people && people.length > 1) {
            this.updatePeople(people);
            resolve(people);
          }
          else {
            this.loadPeople(false).then((people:Person[]) => {
              this.updatePeople(people);
              resolve(people);
            },
            (error:any) => {
              this.updatePeople([]);
              reject(error);
            });
          }
        });
      }
      else {
        this.api.getPeople(this.organization, this.limit, this.offset).then((people:Person[]) => {
          this.logger.info(this, "loadPeople", "Limit", this.limit, "Offset", this.offset, people);
          if (this.mobile) {
            this.database.savePeople(this.organization, people).then((saved:boolean) => {
              this.updatePeople(people);
              resolve(people);
            });
          }
          else {
            this.updatePeople(people);
            resolve(people);
          }
        },
        (error:any) => {
          this.updatePeople([]);
          reject(error);
        });
      }
    });
  }

  private loadMore(cache:boolean=true, event:any=null) {
    return new Promise((resolve, reject) => {
      this.offset = this.offset + this.limit;
      this.logger.info(this, "loadMore", "Limit", this.limit, "Offset", this.offset);
      this.loadPeople(cache).then((people:Person[]) => {
        if (event) {
          event.complete();
        }
        resolve(people);
      },
      (error:any) => {
        if (event) {
          event.complete();
        }
        reject(error);
      });
    });
  }

  private updatePeople(people:Person[]) {
    if (this.people && this.people.length > 0) {
      for (let person of people) {
        let previous = this.people.filter(_person => _person.id == person.id);
        if (previous && previous.length > 0) {
          person.selected = true;
        }
      }
    }
    if (this.offset == 0) {
      this.organization.people = people;
    }
    else {
      this.organization.people = [...this.organization.people, ...people];;
    }
  }

  private loadGroups(cache:boolean=true):Promise<any> {
    this.logger.info(this, "loadGroups", cache);
    return new Promise((resolve, reject) => {
      if (cache && this.mobile) {
        this.database.getGroups(this.organization).then((groups:Group[]) => {
          this.logger.info(this, "loadGroups", "Database", groups);
          if (groups && groups.length > 0) {
            this.updateGroups(groups);
            resolve(groups);
          }
          else {
            this.loadGroups(false).then((groups:Group[]) => {
              this.updateGroups(groups);
              resolve(groups);
            },
            (error:any) => {
              this.updateGroups([]);
              reject(error);
            });
          }
        });
      }
      else {
        this.api.getGroups(this.organization).then((groups:Group[]) => {
          this.logger.info(this, "loadGroups", "API", groups);
          if (this.mobile) {
            this.database.saveGroups(this.organization, groups).then((saved:boolean) => {
              this.updateGroups(groups);
              resolve(groups);
            });
          }
          else {
            this.updateGroups(groups);
            resolve(groups);
          }
        },
        (error:any) => {
          this.updateGroups([]);
          reject(error);
        });
      }
    });
  }

  private updateGroups(groups:Group[]) {
    if (this.groups && this.groups.length > 0) {
      for (let group of groups) {
        let previous = this.groups.filter(_group => _group.id == group.id);
        if (previous && previous.length > 0) {
          if (previous[0].selected == true) {
            group.selected = true;
            this.logger.error(this, "updateGroups", group.name, "Selected");
          }
          else {
            group.selected = false;
            this.logger.info(this, "updateGroups", group.name, "Not Selected");
          }
        }
      }
    }
    this.organization.groups = groups;
  }

  private cancelSelect(event:any) {
    this.hideModal({
      canceled: true
    });
  }

  private doneSelect(event:any) {
    let people = [];
    let groups = [];
    if (this.organization.people && this.organization.people.length > 0) {
      for (let person of this.organization.people) {
        if (person.selected == true) {
          people.push(person);
        }
      }
    }
    if (this.organization.groups && this.organization.groups.length > 0) {
      for (let group of this.organization.groups) {
        if (group.selected == true) {
          groups.push(group);
        }
      }
    }
    this.hideModal({
      people: people,
      groups: groups
    });
  }

}
