import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Events, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';
import { ContactsProvider } from '../../providers/contacts/contacts';

@IonicPage({
  name: 'ContactsMatchPage',
  segment: 'settings/contacts/match',
  defaultHistory: ['ContactsImportPage']
})
@Component({
  selector: 'page-contacts-match',
  templateUrl: 'contacts-match.html',
  providers: [ ApiProvider, StorageProvider, ContactsProvider ]
})
export class ContactsMatchPage extends BasePrivatePage {


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
      protected events:Events) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
      this.data = navParams.get('csvData');
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();

    this.columns = this.data.columns;
    this.preselectMatchingColumns();
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

  private preselectMatchingColumns(columns) {
    for (var i=0; i<this.columns.length; i++) {
      Object.keys(this.columns).forEach(key=> {
        if (this.columns[i].toLowerCase() === key) {
          this.map[key] = i;     
        }
      });
    }
  }

  private importContacts(map) {
    if (this.data) {
      this.logger.info(this, "matchCSVContacts", this.data);
      this.api.matchCSVContacts(this.organization, this.map, this.data).then((data:any) => {
        this.logger.info(this, "contactsMatched", data);
        this.api.importContacts();
      });
    }
  }
}

