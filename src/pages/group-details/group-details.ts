import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';
import { GroupEditPage } from '../../pages/group-edit/group-edit';
import { PersonDetailsPage } from '../../pages/person-details/person-details';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';
import { Group } from '../../models/group';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'GroupDetailsPage',
  segment: 'groups/:group_id',
  defaultHistory: ['GroupListPage']
})
@Component({
  selector: 'page-group-details',
  templateUrl: 'group-details.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ GroupEditPage, PersonDetailsPage ]
})
export class GroupDetailsPage extends BasePrivatePage {

  organization:Organization = null;
  user:User = null;
  group:Group = null;
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

  ionViewDidLoad() {
    super.ionViewDidLoad();
    let loading = this.showLoading("Loading...");
    this.loadUpdates(true).then((loaded:any) => {
      loading.dismiss();
    });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    if (this.organization && this.group) {
      this.analytics.trackPage(this, {
        organization: this.organization.name,
        group: this.group.name
      });
    }
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.loading = true;
    return Promise.resolve()
      .then(() => this.loadOrganization(cache))
      .then(() => this.loadUser(cache))
      .then(() => this.loadGroup(cache))
      .then(() => this.loadMembers(cache))
      .then(() => {
        this.logger.info(this, "loadUpdates", "Loaded");
        if (event) {
          event.complete();
        }
        this.loading = false;
      })
      .catch((error) => {
        this.logger.info(this, "loadUpdates", "Failed", error);
        if (event) {
          event.complete();
        }
        this.loading = false;
        this.showToast(error);
      });
  }

  private loadGroup(cache:boolean=true, event:any=null):Promise<Group> {
    return new Promise((resolve, reject) => {
      if (cache && this.group) {
        if (event) {
          event.complete();
        }
        resolve(this.group);
      }
      else if (this.hasParameter("group")){
        this.group = this.getParameter<Group>("group");
        if (event) {
          event.complete();
        }
        resolve(this.group);
      }
      else if (this.hasParameter("group_id")) {
        let groupId = this.getParameter<number>("group_id");
        this.promiseFallback(cache,
          this.storage.getGroup(this.organization, groupId),
          this.api.getGroup(this.organization, groupId)).then((group:Group) => {
            this.storage.saveGroup(this.organization, group).then((saved:any) => {
              this.group = group;
              if (event) {
                event.complete();
              }
              resolve(group);
            });
        },
        (error:any) => {
          reject(error);
          if (event) {
            event.complete();
          }
        });
      }
      else {
        if (event) {
          event.complete();
        }
        reject("Group Not Provided");
      }
    });
  }

  private loadMembers(cache:boolean=true):Promise<Person[]> {
    return new Promise((resolve, reject) => {
      if (cache && this.group.member_count == this.group.members.length) {
        resolve(this.group.members);
      }
      else {
        this.promiseFallback(cache,
          this.storage.getGroupMembers(this.organization, this.group),
          this.api.getGroupMembers(this.organization, this.group), this.group.member_count).then((people:Person[]) => {
          this.group.members = people;
          resolve(this.group.members);
        });
      }
    });
  }

  private editGroup(event:any) {
    this.logger.info(this, "editGroup");
    let modal = this.showModal(GroupEditPage, {
      organization: this.organization,
      user: this.user,
      person: this.user,
      group: this.group
    });
    modal.onDidDismiss((data:any) => {
      this.logger.info(this, "editGroup", "Modal", data);
      if (data) {
        if (data.deleted) {
          this.logger.info(this, "editGroup", "Modal", "Deleted");
          this.closePage();
        }
        else if (data.canceled) {
          this.logger.info(this, "editGroup", "Modal", "Canceled");
        }
        else {
          let loading = this.showLoading("Loading...");
          this.loadGroup(true).then(group => {
            this.group = group;
            loading.dismiss();
          });
        }
      }
    });
  }

  private showPerson(person:Person) {
    this.logger.info(this, "showPerson", person);
    if (this.tablet || this.website) {
      this.showModal(PersonDetailsPage, {
        organization: this.organization,
        user: this.user,
        person: person
      });
    }
    else {
      this.showPage(PersonDetailsPage, {
        organization: this.organization,
        user: this.user,
        person: person
      });
    }
  }

  get canEdit() {
    if (this.group && this.group.isExternal()) {
      return false;
    }
    return this.user.isOwner() || this.user.isAdmin();
  }

}
