import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'SettingsLDAPPage',
  segment: 'settings/ldap',
  defaultHistory: ['SettingsListPage']
})
@Component({
  selector: 'page-settings-ldap',
  templateUrl: 'settings-ldap.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ ]
})
export class SettingsLDAPPage extends BasePrivatePage {

  // help:string = "https://www.tenfour.org/support/configuring-how-to-send-checkins";
  setting = {
    enabled:      false,
    url:          '',
    base_dn:      '',
    user_filter:  '',
    group_filter: ''
  };

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

        if (this.organization.ldap_settings && this.organization.ldap_settings.length) {
          this.setting = JSON.parse(this.organization.ldap_settings);
        }

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
    if (this.setting.enabled) {
      if (!this.setting.url) {
        return this.showToast("Please specify the LDAP URL", 4000);
      } else if (!this.setting.base_dn) {
        return this.showToast("Please specify the base DN", 4000);
      } else if (!this.setting.user_filter) {
        return this.showToast("Please specify the user filter", 4000);
      } else if (!this.setting.group_filter) {
        return this.showToast("Please specify the group filter", 4000);
      }
    }

    let loading = this.showLoading("Updating...", true);

    this.organization.ldap_settings = JSON.stringify(this.setting);

    this.api.updateOrganization(this.organization).then((organization:Organization) => {
      this.storage.setOrganization(organization).then(saved => {
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

}
