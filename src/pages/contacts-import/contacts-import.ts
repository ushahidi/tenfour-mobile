import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Events, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';
//import { FileTransferProvider } from '../../providers/filetransfer/filetransfer';
import { ContactsProvider } from '../../providers/contacts/contacts';

@IonicPage({
  name: 'ContactsImportPage',
  segment: 'settings/contactsImport',
  defaultHistory: ['SettingsListPage']
})

@Component({
  selector: 'page-contacts-import',
  templateUrl: 'contacts-import.html',
  providers: [ ApiProvider, StorageProvider, ContactsProvider ]
})

export class ContactsImportPage extends BasePrivatePage {

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
      //protected filetransfer:FileTransferProvider,
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

  private uploadCSV(event:any) {
    let loading = this.showLoading("Uploading...", true);

    let options: FileUploadOptions = {
      fileKey: 'file',
      fileName: 'file',
      headers: {}
    }

    /*
    filetransfer.upload(file, this.api.getOrganization(this.organization), options).then((data)) => {
      this.logger.info(this, "CSV Upload", "data");
      this.showPage(ContactMappingPage, {});
    }
    */
    
  }

  private exampleDownloadUrl(event:any) {
    let url = "https://s3.amazonaws.com/ushahidi-tenfour-files/csv_import_example.csv";
    /*
    filetransfer.download(url, this.file.dataDirectory + csv_import_example.csv).then((entry) => {
      this.logger.info(this, "download example csv");
    }, (error:any) => {
      this.showAlert("Problem Downloading Sample CSV", error);
    });
    */
  }

}
