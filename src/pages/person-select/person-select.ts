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
  show_everyone:boolean = false;
  loading:boolean = false;
  everyone:boolean = false;

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

  ionViewDidLoad() {
    super.ionViewDidLoad();
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.show_groups = this.getParameter<boolean>("show_groups");
    this.show_people = this.getParameter<boolean>("show_people");
    this.show_everyone = this.getParameter<boolean>("show_everyone");
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
      let selected = this.getParameter<Group[]>("groups");
      this.promiseFallback(cache,
        this.storage.getGroups(this.organization),
        this.api.getGroups(this.organization), 1).then((groups:Group[]) => {
          this.groups = this.selectGroups(groups, selected);
          this.storage.saveGroups(this.organization, groups).then((saved:boolean) => {
            resolve(this.groups);
          },
          (error:any) => {
            resolve(this.groups);
          });
        },
        (error:any) => {
          this.groups = [];
          reject(error);
        });
    });
  }

  private loadPeople(cache:boolean=true):Promise<any> {
    this.logger.info(this, "loadPeople", cache);
    return new Promise((resolve, reject) => {
      let selected = this.getParameter<Person[]>("people");
      this.promiseFallback(cache,
        this.storage.getPeople(this.organization),
        this.api.getPeople(this.organization), 2).then((people:Person[]) => {
          this.people = this.selectPeople(people, selected);
          this.storage.savePeople(this.organization, people).then((saved:boolean) => {
            resolve(this.people);
          },
          (error:any) => {
            resolve(this.people);
          });
        },
        (error:any) => {
          this.people = [];
          reject(error);
        });
    });
  }

  private selectGroups(groups:Group[], selected:Group[]):Group[] {
    if (groups && groups.length > 0) {
      for (let group of groups) {
        group.selected = false;
        if (selected && selected.length > 0) {
          for (let selection of selected) {
            if (group.id === selection.id) {
              group.selected = true;
              continue;
            }
          }
        }
      }
    }
    return groups;
  }

  private selectPeople(people:Person[], selected:Person[]) {
    if (people && people.length > 0) {
      for (let person of people) {
        person.selected = false;
        if (selected && selected.length > 0) {
          for (let selection of selected) {
            if (person.id === selection.id) {
              person.selected = true;
              continue;
            }
          }
        }
      }
    }
    return people;
  }

  private cancelSelect(event:any) {
    this.hideModal({
      canceled: true
    });
  }

  private doneSelect(event:any) {
    let people = [];
    if (this.people && this.people.length > 0) {
      for (let person of this.people) {
        if (person.selected == true) {
          people.push(person);
        }
      }
    }
    let groups = [];
    if (this.groups && this.groups.length > 0) {
      for (let group of this.groups) {
        if (group.selected == true) {
          groups.push(group);
        }
      }
    }
    if (this.everyone) {
      for (let person of this.people) {
        people.push(person);
      }
    }
    this.hideModal({
      people: people,
      groups: groups,
      everyone: this.everyone
    });
  }

  private selectAllGroups(selected:boolean) {
    for (let group of this.groups) {
      group.selected = selected;
    }
  }

  private selectAllPeople(selected:boolean) {
    for (let person of this.people) {
      person.selected = selected;
    }
  }

}
