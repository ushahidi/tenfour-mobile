import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';
import { DatabaseProvider } from '../../providers/database/database';

@IonicPage({
  name: 'SettingsTypesPage',
  segment: 'settings/types',
  defaultHistory: ['SettingsListPage']
})
@Component({
  selector: 'page-settings-types',
  templateUrl: 'settings-types.html',
  providers: [ ApiProvider, DatabaseProvider, StorageProvider ],
  entryComponents:[  ]
})
export class SettingsTypesPage extends BasePage {

  organization:Organization = null;
  user:User = null;
  types:any = [
    { name: 'Advocacy', key: "advocacy", selected: false },
    { name: 'Anti-Corruption & Transparency', key: "anticorruption", selected: false },
    { name: 'Community Organizing', key: "community", selected: false },
    { name: 'Education', key: "education", selected: false },
    { name: 'Election Monitoring', key: "election", selected: false },
    { name: 'Environmental Monitoring', key: "environmental", selected: false },
    { name: 'First Responders', key: "firstresponders", selected: false },
    { name: 'Government', key: "government", selected: false },
    { name: 'Human Rights', key: "humanrights", selected: false },
    { name: 'Humanitarian & Crisis Response', key: "humanitarian", selected: false },
    { name: 'International Development', key: "internationaldevelopment", selected: false },
    { name: 'Marketing', key: "marketing", selected: false },
    { name: 'Media and Journalism', key: "mediaandjournalism", selected: false },
    { name: 'Research', key: "research", selected: false },
    { name: 'Service Delivery', key: "servicedelivery", selected: false },
    { name: 'Philanthropy', key: "philanthropy", selected: false },
    { name: 'Other', key: "other", selected: false }];

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
      protected storage:StorageProvider,
      protected database:DatabaseProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    let loading = this.showLoading("Loading...");
    this.loadUpdates(true).then((finished:any) => {
      loading.dismiss();
    },
    (error:any) => {
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
    this.logger.info(this, "loadUpdates");
    return Promise.resolve()
      .then(() => { return this.loadOrganization(cache); })
      .then(() => { return this.loadUser(cache); })
      .then(() => { return this.loadTypes(cache); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Done");
        if (event) {
          event.complete();
        }
      })
      .catch((error) => {
        this.logger.error(this, "loadUpdates", "Failed", error);
        if (event) {
          event.complete();
        }
        this.showToast(error);
      });
  }

  private loadOrganization(cache:boolean=true):Promise<Organization> {
    return new Promise((resolve, reject) => {
      if (cache && this.organization) {
        resolve(this.organization);
      }
      else if (this.hasParameter("organization")){
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
      else if (this.hasParameter("user")){
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

  private loadTypes(cache:boolean=true):Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.organization.types) {
        let selected:string[] = this.organization.types.split(",");
        for (let type of this.types) {
          type.selected = selected.indexOf(type.key) > -1;
        }
      }
      resolve(true);
    });
  }

  private cancelEdit(event:any) {
    this.hideModal();
  }

  private doneEdit(event:any) {
    let selected = [];
    for (let type of this.types) {
      if (type.selected == true) {
        selected.push(type.key);
      }
    }
    this.organization.types = selected.join(",");
    let loading = this.showLoading("Updating...");
    this.api.updateOrganization(this.organization).then((organization:Organization) => {
      if (this.mobile) {
        this.database.saveOrganization(organization).then(saved => {
          loading.dismiss();
          this.hideModal({
            organization: organization
          });
        });
      }
      else {
        loading.dismiss();
        this.hideModal({
          organization: organization
        });
      }
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Updating Organization", error);
    });
  }

}
