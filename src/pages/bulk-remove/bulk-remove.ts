import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'BulkRemovePage',
})
@Component({
  selector: 'bulk-remove',
  templateUrl: 'bulk-remove.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ ]
})
export class BulkRemovePage extends BasePrivatePage {

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

  ionViewDidLoad() {
    super.ionViewDidLoad();
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

  ionViewWillLeave() {
    super.ionViewWillLeave();
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.loading = true;
    return Promise.resolve()
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

  private confirm() {
    this.logger.info(this, "confirm");

    let buttons = [
      {
        text: 'Remove',
        handler: this.remove.bind(this)
      },
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          this.logger.info(this, "confirm", "Cancelled");
        }
      }
    ];
    this.showConfirm("Remove People", "Are you sure you want to remove this people?", buttons);
  }

  private remove() {
    this.logger.info(this, "remove");

    let loading = this.showLoading("Removing...", true);
    let promises = [];

    this.people.forEach(person => {
        promises.push(new Promise((resolve, reject) => {
          this.api.deletePerson(this.organization, person).then((deleted:any) => {
            let removes = [];
            removes.push(this.storage.removePerson(this.organization, person));
            for (let contact of person.contacts) {
              removes.push(this.storage.removeContact(this.organization, contact));
            }
            Promise.all(removes).then(resolve, reject);
          }, reject);
        }));
    });

    Promise.all(promises).then(() => {
        loading.dismiss();
        this.hideModal();

        if (promises.length) {
          this.showToast('Removed ' + this.people.length + ' people from the organization');
        }
    },(error:any) => {
      loading.dismiss();
      this.showAlert("Problem Removing People", error);
    });
  }
}
