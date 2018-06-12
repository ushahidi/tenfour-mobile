import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';


import { BasePage } from '../../pages/base-page/base-page';
import { SettingsEditPage } from '../../pages/settings-edit/settings-edit';
import { SettingsRolesPage } from '../../pages/settings-roles/settings-roles';
import { SettingsTypesPage } from '../../pages/settings-types/settings-types';
import { SettingsSizesPage } from '../../pages/settings-sizes/settings-sizes';
import { SettingsRegionsPage } from '../../pages/settings-regions/settings-regions';
import { SettingsPaymentsPage } from '../../pages/settings-payments/settings-payments';
import { SettingsChannelsPage } from '../../pages/settings-channels/settings-channels';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'SettingsListPage',
  segment: 'settings'
})
@Component({
  selector: 'page-settings-list',
  templateUrl: 'settings-list.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ SettingsEditPage, SettingsTypesPage, SettingsSizesPage, SettingsRegionsPage, SettingsRolesPage, SettingsPaymentsPage, SettingsChannelsPage ]
})
export class SettingsListPage extends BasePage {

  organization:Organization = null;
  user:User = null;
  logo:string = "assets/images/dots.png";

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
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    let loading = this.showLoading("Loading...");
    this.loadUpdates(true).then((finished:any) => {
      loading.dismiss();
    },
    (error:any) => {
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

  private loadOrganization(cache:boolean=true):Promise<Organization> {
    return new Promise((resolve, reject) => {
      if (cache && this.organization) {
        resolve(this.organization);
      }
      else if (this.hasParameter("organization")){
        this.organization = this.getParameter<Organization>("organization");
        resolve(this.organization);
      }
      else {
        this.storage.getOrganization().then((organization:Organization) => {
          this.organization = organization;
          resolve(this.organization);
        });
      }
    });
  }

  private loadUser(cache:boolean=true):Promise<User> {
    return new Promise((resolve, reject) => {
      if (cache && this.user) {
        resolve(this.user);
      }
      else if (this.hasParameter("user")){
        this.user = this.getParameter<User>("user");
        resolve(this.user);
      }
      else {
        this.storage.getUser().then((user:User) => {
          this.user = user;
          resolve(this.user);
        });
      }
    });
  }

  private settingsEdit(event:any) {
    this.logger.info(this, "settingsEdit");
    this.showModal(SettingsEditPage, {
      organization: this.organization,
      user: this.user
    });
  }

  private settingsTypes(event:any) {
    this.logger.info(this, "settingsTypes");
    this.showModal(SettingsTypesPage, {
      organization: this.organization,
      user: this.user
    });
  }

  private settingsSizes(event:any) {
    this.logger.info(this, "settingsSizes");
    this.showModal(SettingsSizesPage, {
      organization: this.organization,
      user: this.user
    });
  }

  private settingsRegions(event:any) {
    this.logger.info(this, "settingsRegions");
    this.showModal(SettingsRegionsPage, {
      organization: this.organization,
      user: this.user
    });
  }

  private settingsRoles(event:any) {
    this.logger.info(this, "settingsRoles");
    this.showModal(SettingsRolesPage, {
      organization: this.organization,
      person: this.user
    });
  }

  private settingsPayments(event:any) {
    this.logger.info(this, "settingsPayments");
    this.navController.push(SettingsPaymentsPage, {
      organization: this.organization,
      user: this.user
    });
  }

  private settingsCheckins(event:any) {
    this.logger.info(this, "settingsCheckins");
    this.showModal(SettingsChannelsPage, {
      organization: this.organization,
      user: this.user
    });
  }

}
