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
    let data = this.getParameter<any>('data');
    let columns = data.file.columns;
    this.preselectMatchingColumns(columns);
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
    for (var i=0; i<Object.keys(columns).length; i++) {
      let map = {
        name: null,
        description: null,
        phone: null,
        email: null,
        address: null,
        twitter: null
      };

      Object.keys(map).forEach((key) => {
        if (columns[i].toLowerCase() === key) {
          map[key] = i;
        }
      });
    }
  }

  private importContacts(map, data:any) {
    if (data) {
      this.logger.info(this, "matchCSVContacts", this.data);
      this.api.matchCSVContacts(this.organization, this.map, this.data).then((data:any) => {
        this.logger.info(this, "contactsMatched", data);
        this.api.importContacts(this.organization, this.data);
      });
    }
  }
}
