import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';
import { Group } from '../../models/group';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

import { EVENT_GROUP_CHANGED } from '../../constants/events';

@IonicPage({
  name: 'BulkAddToGroupPage'
})
@Component({
  selector: 'bulk-addtogroup',
  templateUrl: 'bulk-addtogroup.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ ]
})
export class BulkAddToGroupPage extends BasePrivatePage {

  loading:boolean = false;
  people:Person[] = [];
  organization:Organization;

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
    this.people = this.navParams.get('people');
  }

  loadUpdates(cache:boolean=true, event:any=null) {
    this.loading = true;
    return Promise.resolve()
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

  loadGroups(cache:boolean=true):Promise<any> {
    this.logger.info(this, "loadGroups", cache);
    return new Promise((resolve, reject) => {
      this.promiseFallback(cache,
        this.storage.getGroups(this.organization),
        this.api.getGroups(this.organization), 1).then((groups:Group[]) => {
          this.organization.groups = groups;
          resolve(groups);
        },
        (error:any) => {
          this.organization.groups = [];
          reject(error);
        });
    });
  }

  addPeopleToGroups() {
    this.logger.info(this, "addPeopleToGroups");
    let loading = this.showLoading("Saving...", true);
    let promises = [];
    this.organization.groups.forEach(group => {
        if (group.selected) {
          this.people.forEach(person => { group.members.push(person); });
          promises.push(new Promise((resolve, reject) => {
            this.api.updateGroup(this.organization, group).then((updatedGroup:Group) => {
              this.storage.saveGroup(this.organization, updatedGroup).then((saved:any) => {
                this.events.publish(EVENT_GROUP_CHANGED, updatedGroup.id);
                resolve();
              });
            }, reject);
          }));
        }
    });
    Promise.all(promises).then(() => {
        loading.dismiss();
        this.hideModal();

        if (promises.length) {
          this.showToast('Added ' +
            this.people.length + ' ' +
            (this.people.length==1?'person':'people') +
            ' to ' + promises.length + ' ' +
            (promises.length==1?'group':'groups'));
        }
    },(error:any) => {
      loading.dismiss();
      this.showAlert("Problem Adding Selected People to Groups", error);
    });
  }
}
