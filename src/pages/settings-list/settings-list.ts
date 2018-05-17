import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { ApiProvider } from '../../providers/api/api';
import { DatabaseProvider } from '../../providers/database/database';

import { BasePage } from '../../pages/base-page/base-page';
import { SettingsEditPage } from '../../pages/settings-edit/settings-edit';
import { SettingsRolesPage } from '../../pages/settings-roles/settings-roles';
import { SettingsTypesPage } from '../../pages/settings-types/settings-types';
import { SettingsSizesPage } from '../../pages/settings-sizes/settings-sizes';
import { SettingsRegionsPage } from '../../pages/settings-regions/settings-regions';
import { SettingsPaymentsPage } from '../../pages/settings-payments/settings-payments';
import { SettingsCheckinsPage } from '../../pages/settings-checkins/settings-checkins';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';

@IonicPage({
  segment: 'settings'
})
@Component({
  selector: 'page-settings-list',
  templateUrl: 'settings-list.html',
  providers: [ ApiProvider ],
  entryComponents:[ SettingsEditPage, SettingsTypesPage, SettingsSizesPage, SettingsRegionsPage, SettingsRolesPage, SettingsPaymentsPage, SettingsCheckinsPage ]
})
export class SettingsListPage extends BasePage {

  organization:Organization = null;
  person:Person = null;
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
      protected database:DatabaseProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.person =  this.getParameter<Person>("person");
    this.logger.info(this, "Organization", this.organization);
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    if (this.organization) {
      this.trackPage({
        organization: this.organization.name
      });
    }
  }

  private settingsEdit(event:any) {
    this.logger.info(this, "settingsEdit");
    this.showModal(SettingsEditPage, {
      organization: this.organization,
      person: this.person
    });
  }

  private settingsTypes(event:any) {
    this.logger.info(this, "settingsTypes");
    this.showModal(SettingsTypesPage, {
      organization: this.organization,
      person: this.person
    });
  }

  private settingsSizes(event:any) {
    this.logger.info(this, "settingsSizes");
    this.showModal(SettingsSizesPage, {
      organization: this.organization,
      person: this.person
    });
  }

  private settingsRegions(event:any) {
    this.logger.info(this, "settingsRegions");
    this.showModal(SettingsRegionsPage, {
      organization: this.organization,
      person: this.person
    });
  }

  private settingsRoles(event:any) {
    this.logger.info(this, "settingsRoles");
    this.showModal(SettingsRolesPage, {
      organization: this.organization,
      person: this.person
    });
  }

  private settingsPayments(event:any) {
    this.logger.info(this, "settingsPayments");
    this.showModal(SettingsPaymentsPage, {
      organization: this.organization,
      person: this.person
    });
  }

  private settingsCheckins(event:any) {
    this.logger.info(this, "settingsCheckins");
    this.showModal(SettingsCheckinsPage, {
      organization: this.organization,
      person: this.person
    });
  }

}
