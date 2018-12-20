import { Component, NgZone, ViewChild } from '@angular/core';
import { App, IonicPage, Platform, TextInput, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController, PopoverController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';
import { CheckinSendPage } from '../../pages/checkin-send/checkin-send';

import { Template } from '../../models/template';
import { Checkin } from '../../models/checkin';
import { Organization } from '../../models/organization';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'CheckinTemplatesPage',
  segment: 'checkins/templates',
  defaultHistory: ['CheckinEditPage']
})
@Component({
  selector: 'page-checkin-templates',
  templateUrl: 'checkin-templates.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[  ]
})
export class CheckinTemplatesPage extends BasePrivatePage {

  loading:boolean = false;
  templates:Template[] = [];
  organization:Organization = null;

  constructor(
      protected appController:App,
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
      protected popoverController:PopoverController,
      protected api:ApiProvider,
      protected storage:StorageProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    let loading = this.showLoading("Loading...");
    this.loading = true;
    this.loadUpdates(true).then((loaded:any) => {
      loading.dismiss();
    });
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.organization = this.getParameter('organization');
    this.loading = true;

    return Promise.resolve()
      .then(() => this.loadTemplates(cache))
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
        this.showToast(error);
        this.loading = false;
      });
  }

  private loadTemplates(cache:boolean=true):Promise<any> {
    this.logger.info(this, "loadGroups", cache);
    return new Promise((resolve, reject) => {
      this.promiseFallback(cache,
        this.storage.getTemplates(this.organization),
        this.api.getTemplates(this.organization), 1).then((templates:Template[]) => {
          this.templates = templates;
          resolve(templates);
        },
        (error:any) => {
          this.organization.groups = [];
          reject(error);
        });
    });
  }

  private delete(template:Template) {
    this.logger.info(this, "delete", template);

    let loading = this.showLoading("Deleting...", true);

    template.template = false;

    this.api.updateCheckin(this.organization, <Checkin>template)
      .then((checkin:Checkin) => { return this.storage.saveCheckin(this.organization, checkin); })
      .then((saved) => {
        loading.dismiss();
        this.showToast("Saved check-in deleted");
        this.loadUpdates();
      })
      .catch((error:any) => {
        loading.dismiss();
        this.showAlert("The saved check-in could not be deleted", error);
      });
  }

  private showConfirmDelete(template:Template) {
    this.logger.info(this, "showConfirmDelete", template);
    let buttons = [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          this.logger.info(this, "save", "Cancelled");
        }
      },
      {
        text: 'Delete',
        handler: () => { this.delete(template); }
      }
    ];
    this.showConfirm("Are you sure?", "Deleting this check-in template can't be undone.", buttons);
  }

  private sendTemplate(template:Template) {
    this.logger.info(this, "sendTemplate", template);

    let checkin = new Checkin(template);
    checkin.template = false;

    this.showModal(CheckinSendPage, {
      organization: this.organization,
      user: this.user,
      checkin: new Checkin(checkin)
    });
  }
}
