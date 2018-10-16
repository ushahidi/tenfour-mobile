import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'BulkChangeRolePage',
})
@Component({
  selector: 'bulk-changerole',
  templateUrl: 'bulk-changerole.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ ]
})
export class BulkChangeRolePage extends BasePrivatePage {

  loading:boolean = false;
  people:Person[] = [];
  organization:Organization;
  role:string = 'multiple';

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

  private save() {
    this.logger.info(this, "save");

    if (this.people.find(person => {
      return person.id === this.user.id;
    })) {
      let buttons = [
        {
          text: 'Continue',
          handler: this.changeRole.bind(this)
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.logger.info(this, "save", "Cancelled");
          }
        }
      ];
      this.showConfirm("Change Role", "This operation will change your role.", buttons);
    } else {
      this.changeRole();
    }
  }

  private changeRole() {
    this.logger.info(this, "changeRole");

    let loading = this.showLoading("Saving...", true);
    let promises = [];

    this.people.forEach(person => {
        if (this.role === 'multiple') {
          return;
        }

        person.role = this.role;

        promises.push(new Promise((resolve, reject) => {
          this.api.updatePerson(this.organization, person).then((person:Person) => {
            return this.storage.savePerson(this.organization, person).then((saved:any) => {
              resolve(person);
            }, reject);
          }, reject);
        }));
    });

    Promise.all(promises).then(() => {
        loading.dismiss();
        this.hideModal();

        if (promises.length) {
          this.showToast('Updated the role of ' + this.people.length + ' people');
        }
    },(error:any) => {
      loading.dismiss();
      this.showAlert("Problem Changing Roles", error);
    });
  }
}
