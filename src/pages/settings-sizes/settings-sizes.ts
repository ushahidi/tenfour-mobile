import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';
import { SettingsEditPage } from '../../pages/settings-edit/settings-edit';
import { SettingsRolesPage } from '../../pages/settings-roles/settings-roles';
import { SettingsPaymentsPage } from '../../pages/settings-payments/settings-payments';
import { SettingsChannelsPage } from '../../pages/settings-channels/settings-channels';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'SettingsSizesPage',
  segment: 'settings/sizes',
  defaultHistory: ['SettingsListPage']
})
@Component({
  selector: 'page-settings-sizes',
  templateUrl: 'settings-sizes.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ SettingsEditPage, SettingsRolesPage, SettingsPaymentsPage, SettingsChannelsPage ]
})
export class SettingsSizesPage extends BasePrivatePage {

  sizes:any = [
    { name: 'Unspecified', key: "unspecified" },
    { name: '1-10', key: "1-10" },
    { name: '11-50', key: "11-50" },
    { name: '51-100', key: "51-100" },
    { name: '101-250', key: "101-250" },
    { name: '251-500', key: "251-500" },
    { name: '501-1000', key: "501-1000" },
    { name: 'More than 1000', key: "More than 1000" }];

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
    this.logger.info(this, "doneEdit", "Size", this.organization.size)
    let loading = this.showLoading("Updating...", true);
    this.api.updateOrganization(this.organization).then((organization:Organization) => {
      this.logger.info(this, "doneEdit", "Organization", organization);
      Promise.all([
        this.storage.setOrganization(organization),
        this.storage.saveOrganization(organization)]).then(((saved:any[]) => {
          loading.dismiss();
          this.hideModal({
            organization: organization
          });
        }));
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Updating Organization", error);
    });
  }

}
