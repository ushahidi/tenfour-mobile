import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';
import { GroupEditPage } from '../../pages/group-edit/group-edit';
import { GroupDetailsPage } from '../../pages/group-details/group-details';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';
import { Group } from '../../models/group';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

import {
  EVENT_GROUP_ADDED,
  EVENT_GROUP_CHANGED,
  EVENT_GROUP_DELETED } from '../../constants/events';

@IonicPage({
  name: 'GroupListPage',
  segment: 'groups'
})
@Component({
  selector: 'page-group-list',
  templateUrl: 'group-list.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ GroupEditPage, GroupDetailsPage ]
})
export class GroupListPage extends BasePrivatePage {

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
      protected api:ApiProvider,
      protected storage:StorageProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
    this.limit = this.website ? 30 : 20;
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
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
    this.events.subscribe(EVENT_GROUP_ADDED, (groupId:number) => {
      this.logger.info(this, EVENT_GROUP_ADDED, groupId);
      this.loadGroups(false).then((groups:Group[]) => {
        this.logger.info(this, EVENT_GROUP_ADDED, groupId, "Loaded");
      },
      (error:any) => {
        this.logger.warn(this, EVENT_GROUP_ADDED, groupId, "Failed", error);
      });
    });
    this.events.subscribe(EVENT_GROUP_CHANGED, (groupId:number) => {
      this.logger.info(this, EVENT_GROUP_CHANGED, groupId);
      this.loadGroups(false).then((groups:Group[]) => {
        this.logger.info(this, EVENT_GROUP_CHANGED, groupId, "Loaded");
      },
      (error:any) => {
        this.logger.warn(this, EVENT_GROUP_CHANGED, groupId, "Failed", error);
      });
    });
    this.events.subscribe(EVENT_GROUP_DELETED, (groupId:number) => {
      this.logger.info(this, EVENT_GROUP_DELETED, groupId);
      this.loadGroups(false).then((groups:Group[]) => {
        this.logger.info(this, EVENT_GROUP_DELETED, groupId, "Loaded");
      },
      (error:any) => {
        this.logger.warn(this, EVENT_GROUP_DELETED, groupId, "Failed", error);
      });
    });
  }

  ionViewWillLeave() {
    super.ionViewWillLeave();
    this.events.unsubscribe(EVENT_GROUP_ADDED);
    this.events.unsubscribe(EVENT_GROUP_CHANGED);
    this.events.unsubscribe(EVENT_GROUP_DELETED);
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.loading = true;
    return Promise.resolve()
      .then(() => this.loadOrganization(cache))
      .then(() => this.loadUser(cache))
      .then(() => this.loadGroups(cache))
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
      this.offset = 0;
      this.promiseFallback(cache,
        this.storage.getGroups(this.organization, this.limit, this.offset),
        this.api.getGroups(this.organization, this.limit, this.offset), 1).then((groups:Group[]) => {
          this.storage.saveGroups(this.organization, groups).then((saved:boolean) => {
            this.organization.groups = groups;
            resolve(groups);
          },
          (error:any) => {
            this.organization.groups = groups;
            resolve(groups);
          });
        },
        (error:any) => {
          this.organization.groups = [];
          reject(error);
        });
    });
  }

  private loadMore(event:any) {
    return new Promise((resolve, reject) => {
      this.offset = this.offset + this.limit;
      this.logger.info(this, "loadMore", "Limit", this.limit, "Offset", this.offset);
      this.promiseFallback(true,
        this.storage.getGroups(this.organization, this.limit, this.offset),
        this.api.getGroups(this.organization, this.limit, this.offset)).then((groups:Group[]) => {
          this.storage.saveGroups(this.organization, groups).then((saved:boolean) => {
            this.organization.groups = [...this.organization.groups, ...groups];
            if (event) {
              event.complete();
            }
            this.logger.info(this, "loadMore", "Limit", this.limit, "Offset", this.offset, "Total", this.organization.groups.length);
            resolve(this.organization.groups);
          });
        });
    });
  }

  private createGroup(event:any) {
    this.logger.info(this, "createGroup");
    let modal = this.showModal(GroupEditPage, {
      organization: this.organization,
      person: this.user
    });
    modal.onDidDismiss((data:any) => {
      this.logger.info(this, "createGroup", data);
      if (data && data.group) {
        let loading = this.showLoading("Loading...");
        this.loadGroups(false).then(loaded => {
          loading.dismiss();
        },
        (error:any) => {
          loading.dismiss();
        });
      }
    });
  }

  private removeGroup(group:Group) {
    this.logger.info(this, "removeGroup", group);
    let loading = this.showLoading("Removing...", true);
    this.api.deleteGroup(this.organization, group).then((deleted:any) => {
      if (this.mobile) {
        this.storage.removeGroup(this.organization, group).then((removed:any) => {
          let index = this.organization.groups.indexOf(group);
          if (index > -1) {
            this.organization.groups.splice(index, 1);
          }
          loading.dismiss();
        },
        (error:any) => {
          loading.dismiss();
          this.showAlert("Problem Removing Group", error);
        });
      }
      else {
        let index = this.organization.groups.indexOf(group);
        if (index > -1) {
          this.organization.groups.splice(index, 1);
        }
        loading.dismiss();
      }
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Removing Group", error);
    });
  }

  private showGroup(group:Group) {
    this.logger.info(this, "showGroup", group);
    this.showModalOrPage(GroupDetailsPage, {
      organization: this.organization,
      person: this.user,
      group: group,
      group_id: group.id
    });
  }

}
