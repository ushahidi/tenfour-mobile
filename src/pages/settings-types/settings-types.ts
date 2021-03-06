import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'SettingsTypesPage',
  segment: 'settings/types',
  defaultHistory: ['SettingsListPage']
})
@Component({
  selector: 'page-settings-types',
  templateUrl: 'settings-types.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ ]
})
export class SettingsTypesPage extends BasePrivatePage {

  types:any = [
    { name: 'Advocacy', key: "advocacy", selected: false },
    { name: 'Anti-Corruption & Transparency', key: "anticorruption", selected: false },
    { name: 'Community Organizing', key: "community", selected: false },
    { name: 'Schools', key: "schools", selected: false },
    { name: 'Election Monitoring', key: "election", selected: false },
    { name: 'Environmental Monitoring', key: "environmental", selected: false },
    { name: 'First Responders', key: "firstresponders", selected: false },
    { name: 'Government', key: "government", selected: false },
    { name: 'Human Rights', key: "humanrights", selected: false },
    { name: 'Small business', key: "smallbusiness", selected: false },
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
      protected storage:StorageProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
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
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    return Promise.resolve()
      .then(() => { return this.loadOrganization(cache); })
      .then(() => { return this.loadUser(cache); })
      .then(() => { return this.loadTypes(cache); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Loaded");
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
    let loading = this.showLoading("Updating...", true);
    this.api.updateOrganization(this.organization).then((organization:Organization) => {
      if (this.mobile) {
        this.storage.saveOrganization(organization).then(saved => {
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
