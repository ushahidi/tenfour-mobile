import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Events, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';
import { ContactsMatchPage } from '../../pages/contacts-match/contacts-match';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';
import { ContactsProvider } from '../../providers/contacts/contacts';

@IonicPage({
  name: 'ContactsImportPage',
  segment: 'settings/contacts',
  defaultHistory: ['SettingsListPage']
})

@Component({
  selector: 'page-contacts-import',
  templateUrl: 'contacts-import.html',
  providers: [ ApiProvider, StorageProvider, ContactsProvider ]
})

export class ContactsImportPage extends BasePrivatePage {

  @ViewChild("fileInput")
  fileInput:any = null;
  fileData:any = null;

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

  private onFileChanged(event:any){
    this.logger.info(this, "onFileChanged", event.target);
    if (event.target.files && event.target.files.length > 0) {
      this.fileData = event.target.files[0];
      this.logger.info(this, "onFileChanged", "FilePath", this.fileData);
    }
  }

  private uploadCSV(event:any) {
    if (this.fileData) {
      let loading = this.showLoading("Uploading...", true);
      this.logger.info(this, "uploadCSV", this.fileData);
      this.api.uploadContactsCSV(this.organization, this.fileData).then((data:any) => {
        this.logger.info(this, "uploadCSV", data);
        loading.dismiss();
        this.showModal(ContactsMatchPage, {
          organization: this.organization,
          user: this.user,
          data: data
        });
      },
      (error:any) => {
        loading.dismiss();
        this.showAlert("Problem Uploading CSV", error);
      });
    }
  }

  private downloadCSV(event:any) {
    let url = "https://s3.amazonaws.com/ushahidi-tenfour-files/csv_import_example.csv";
    this.showToast("Not implemented yet...");
  }

  private cancelImport(event:any) {
    this.hideModal();
  }

}
