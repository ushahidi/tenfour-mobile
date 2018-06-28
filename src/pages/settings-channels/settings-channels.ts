import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

import { SettingsPaymentsPage } from '../../pages/settings-payments/settings-payments';

@IonicPage({
  name: 'SettingsChannelsPage',
  segment: 'settings/channels',
  defaultHistory: ['SettingsListPage']
})
@Component({
  selector: 'page-settings-channels',
  templateUrl: 'settings-channels.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[  ]
})
export class SettingsChannelsPage extends BasePrivatePage {

  url:string = "https://app.tenfour.org";
  help:string = "https://www.tenfour.org/support/configuring-how-to-send-checkins";

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

  private cancelEdit(event:any) {
    this.hideModal();
  }

  private doneEdit(event:any) {
    let loading = this.showLoading("Updating...", true);
    this.api.updateOrganization(this.organization).then((organization:Organization) => {
      this.storage.saveOrganization(organization).then(saved => {
        loading.dismiss();
        this.hideModal({
          organization: organization
        });
      });
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Updating Organization", error);
    });
  }

  private upgradeToPro(event:any) {
    this.logger.info(this, "upgradeToPro");
    this.showPage(SettingsPaymentsPage);
  }
}
