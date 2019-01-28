import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Events, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';
import { PersonListPage } from '../../pages/person-list/person-list';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';
import { ContactsProvider } from '../../providers/contacts/contacts';

@IonicPage({
  name: 'ContactsMatchPage',
  segment: 'settings/contacts',
  defaultHistory: ['ContactsImportPage']
})
@Component({
  selector: 'page-contacts-match',
  templateUrl: 'contacts-match.html',
  providers: [ ApiProvider, StorageProvider, ContactsProvider ]
})
export class ContactsMatchPage extends BasePrivatePage {

  data:any = null;
  columns:any = null;
  map:any = {};
  myIndex:number = 0;
  Object:any = [];

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
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
    this.data = this.getParameter<any>('data');
    this.columns = this.data.file.columns;
    this.map = {
      name: null,
      description: null,
      phone: null,
      email: null,
      address: null,
      role: null,
      groups: null
    };
    this.preselectMatchingColumns(this.columns, this.map);
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

  private preselectMatchingColumns(columns, map) {
    for (let column of columns) {
      for (let key of Object.keys(map)) {
        if (column.toLowerCase() === key.toLowerCase()) {
          map[key] = column;
        }
      }
    }
  }

  private importContacts(event:any) {
    this.api.matchCSVContacts(this.organization, this.map, this.data).then((data:any) => {
      this.logger.info(this, "contactsMatched", data);
      let loading = this.showLoading("Importing...", true);
      this.api.importContacts(this.organization, this.data).then((data:any) => {
        this.logger.info(this, "Contacts", true);
        loading.dismiss();
        if (data) {
          this.showToast("Your upload is in progress.This might take a few minutes.We will send you a notification when it's done.");
          this.showPage(PersonListPage);
        }
      },
      (error:any) => {
        loading.dismiss();
        this.showAlert("Could not process the CSV, please check the file format and column names and try again.", error);
      });
    });
  }

  private cancelImport(event:any) {
    this.hideModal();
  }
}
