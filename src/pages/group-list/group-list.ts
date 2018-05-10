import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { GroupEditPage } from '../../pages/group-edit/group-edit';
import { GroupDetailsPage } from '../../pages/group-details/group-details';

import { ApiProvider } from '../../providers/api/api';
import { DatabaseProvider } from '../../providers/database/database';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Group } from '../../models/group';

@IonicPage()
@Component({
  selector: 'page-group-list',
  templateUrl: 'group-list.html',
  providers: [ ApiProvider, DatabaseProvider ],
  entryComponents:[ GroupEditPage, GroupDetailsPage ]
})
export class GroupListPage extends BasePage {

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
      protected api:ApiProvider,
      protected database:DatabaseProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.person = this.getParameter<Person>("person");
    let loading = this.showLoading("Loading...");
    this.loadUpdates(true).then((loaded:any) => {
      loading.dismiss();
    })
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.trackPage({
      organization: this.organization.name
    });
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.loading = true;
    return Promise.all([this.loadGroups(cache)]).then(
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
      this.api.getGroups(this.organization, this.limit, this.offset).then((groups:Group[]) => {
        let saves = [];
        for (let group of groups) {
          saves.push(this.database.saveGroup(this.organization, group));
        }
        Promise.all(saves).then(saved => {
          this.organization.groups = [...this.organization.groups, ...groups];
          if (event) {
            event.complete();
          }
          this.logger.info(this, "loadMore", "Limit", this.limit, "Offset", this.offset, "Total", this.organization.groups.length);
          resolve(this.organization.groups);
        });
      },
      (error:any) => {
        this.logger.error(this, "loadMore", "Limit", this.limit, "Offset", this.offset, "Error", error);
        if (event) {
          event.complete();
        }
        resolve(this.organization.groups);
      });
    });
  }

  private loadGroups(cache:boolean=true):Promise<any> {
    this.logger.info(this, "loadGroups", cache);
    return new Promise((resolve, reject) => {
      this.offset = 0;
      if (cache) {
        this.database.getGroups(this.organization, this.limit, this.offset).then((groups:Group[]) => {
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
        },
        (error:any) => {
          this.logger.error(this, "loadGroups", error);
          reject(error);
        });
      }
      else {
        this.api.getGroups(this.organization).then((groups:Group[]) => {
          this.logger.info(this, "loadGroups", "API", groups);
          let saves = [];
          for (let group of groups) {
            saves.push(this.database.saveGroup(this.organization, group));
          }
          Promise.all(saves).then(saved => {
            this.logger.info(this, "loadGroups", "API", "Done");
            this.database.getGroups(this.organization, this.limit, this.offset).then((groups:Group[]) => {
              this.organization.groups = groups;
              resolve(groups);
            });
          });
        },
        (error:any) => {
          this.organization.groups = [];
          reject(error);
        });
      }
    });
  }

  private createGroup(event:any) {
    this.logger.info(this, "createGroup");
    let modal = this.showModal(GroupEditPage,
      { organization: this.organization,
        person: this.person });
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

  private showGroup(group:Group) {
    this.logger.info(this, "showGroup", group);
    this.showPage(GroupDetailsPage,
      { organization: this.organization,
        person: this.person,
        group: group });
  }

}
