import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Group } from '../../models/group';
import { Person } from '../../models/person';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'PersonSelectPage',
  segment: 'people/select'
})
@Component({
  selector: 'page-person-select',
  templateUrl: 'person-select.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ ]
})
export class PersonSelectPage extends BasePage {

  organization:Organization = null;
  user:User = null;
  people:Person[] = null;
  groups:Group[] = null;
  show_groups:boolean = true;
  show_people:boolean = true;
  limit:number = 25;
  offset:number = 0;
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
      protected api:ApiProvider,
      protected storage:StorageProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.show_groups = this.getParameter<boolean>("show_groups");
    this.show_people = this.getParameter<boolean>("show_people");
    let loading = this.showLoading("Loading...");
    this.loadUpdates(true).then((loaded:any) => {
      loading.dismiss();
    });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    if (this.organization) {
      this.analytics.trackPage(this, {
        organization: this.organization.name
      });
    }
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    this.loading = true;
    return Promise.resolve()
      .then(() => { return this.loadOrganization(cache); })
      .then(() => { return this.loadUser(cache); })
      .then(() => { return this.loadPeople(cache); })
      .then(() => { return this.loadGroups(cache); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Loaded");
        if (event) {
          event.complete();
        }
        this.loading = false;
      })
      .catch((error:any) => {
        this.logger.error(this, "loadUpdates", "Failed", error);
        if (event) {
          event.complete();
        }
        this.loading = false;
        this.showToast(error);
      });
  }

  private loadOrganization(cache:boolean=true):Promise<Organization> {
    return new Promise((resolve, reject) => {
      if (cache && this.organization) {
        resolve(this.organization);
      }
      else if (cache && this.hasParameter("organization")){
        this.organization = this.getParameter<Organization>("organization");
        resolve(this.organization);
      }
      else {
        this.storage.getOrganization().then((organization:Organization) => {
          this.organization = organization;
          resolve(this.organization);
        });
      }
    });
  }

  private loadUser(cache:boolean=true):Promise<User> {
    return new Promise((resolve, reject) => {
      if (cache && this.user) {
        resolve(this.user);
      }
      else if (cache && this.hasParameter("user")){
        this.user = this.getParameter<User>("user");
        resolve(this.user);
      }
      else {
        this.storage.getUser().then((user:User) => {
          this.user = user;
          resolve(this.user);
        });
      }
    });
  }

  private loadGroups(cache:boolean=true):Promise<any> {
    this.logger.info(this, "loadGroups", cache);
    return new Promise((resolve, reject) => {
      this.groups = this.getParameter<Group[]>("groups");
      this.promiseFallback(cache,
        this.storage.getGroups(this.organization),
        this.api.getGroups(this.organization), 1).then((groups:Group[]) => {
          this.storage.saveGroups(this.organization, groups).then((saved:boolean) => {
            this.updateGroups(groups);
            resolve(groups);
          });
        },
        (error:any) => {
          this.updateGroups([]);
          reject(error);
        });
    });
  }

  private loadPeople(cache:boolean=true):Promise<any> {
    this.logger.info(this, "loadPeople", cache);
    return new Promise((resolve, reject) => {
      this.offset = 0;
      this.people = this.getParameter<Person[]>("people");
      this.promiseFallback(cache,
        this.storage.getPeople(this.organization, null, this.limit, this.offset),
        this.api.getPeople(this.organization, this.limit, this.offset), 2).then((people:Person[]) => {
          this.storage.savePeople(this.organization, people).then((saved:boolean) => {
            this.updatePeople(people);
            resolve(people);
          });
        },
        (error:any) => {
          this.updatePeople([]);
          reject(error);
        });
    });
  }

  private loadMore(cache:boolean=true, event:any=null) {
    return new Promise((resolve, reject) => {
      this.offset = this.offset + this.limit;
      this.promiseFallback(cache,
        this.storage.getPeople(this.organization, null, this.limit, this.offset),
        this.api.getPeople(this.organization, this.limit, this.offset), 1).then((people:Person[]) => {
          this.storage.savePeople(this.organization, people).then((saved:boolean) => {
            this.updatePeople(people);
            if (event) {
              event.complete();
            }
            resolve(people);
          });
        },
        (error:any) => {
          this.updatePeople([]);
          if (event) {
            event.complete();
          }
          reject(error);
        });
    });
  }

  private updateGroups(groups:Group[]) {
    if (this.groups && this.groups.length > 0) {
      for (let group of groups) {
        let previous = this.groups.filter(_group => _group.id == group.id);
        if (previous && previous.length > 0) {
          group.selected = true;
        }
      }
    }
    this.organization.groups = groups;
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
      this.organization.people = [...this.organization.people, ...people];
    }
  }

  private cancelSelect(event:any) {
    this.hideModal({
      canceled: true
    });
  }

  private doneSelect(event:any) {
    let people = [];
    if (this.organization.people && this.organization.people.length > 0) {
      for (let person of this.organization.people) {
        if (person.selected == true) {
          people.push(person);
        }
      }
    }
    let groups = [];
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
