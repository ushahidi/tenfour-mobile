import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';

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
export class PersonSelectPage extends BasePrivatePage {

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
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
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
      .then(() => { return this.loadGroups(cache); })
      .then(() => { return this.loadPeople(cache); })
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

  private loadGroups(cache:boolean=true):Promise<any> {
    this.logger.info(this, "loadGroups", cache);
    return new Promise((resolve, reject) => {
      this.groups = this.getParameter<Group[]>("groups");
      this.promiseFallback(cache,
        this.storage.getGroups(this.organization),
        this.api.getGroups(this.organization, this.limit), 1).then((groups:Group[]) => {
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
        this.storage.getPeople(this.organization),
        this.api.getPeople(this.organization), 2).then((people:Person[]) => {
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

  private selectAllGroups(selection:boolean) {
    for (let group of this.organization.groups) {
      group.selected = selection;
    }
  }

  private selectAllPeople(selection:boolean) {
    for (let person of this.organization.people) {
      person.selected = selection;
    }
  }

}
