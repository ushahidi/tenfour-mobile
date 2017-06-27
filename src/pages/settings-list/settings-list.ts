import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { BasePage } from '../../pages/base-page/base-page';
import { SettingsEditPage } from '../../pages/settings-edit/settings-edit';
import { SettingsRolesPage } from '../../pages/settings-roles/settings-roles';
import { SettingsTypesPage } from '../../pages/settings-types/settings-types';
import { SettingsPaymentsPage } from '../../pages/settings-payments/settings-payments';
import { SettingsRollcallsPage } from '../../pages/settings-rollcalls/settings-rollcalls';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';

@IonicPage()
@Component({
  selector: 'page-settings-list',
  templateUrl: 'settings-list.html',
  providers: [ ApiService ],
  entryComponents:[ SettingsEditPage, SettingsTypesPage, SettingsRolesPage, SettingsPaymentsPage, SettingsRollcallsPage ]
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
      protected api:ApiService,
      protected database:DatabaseService) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.person =  this.getParameter<Person>("person");
    this.logger.info(this, "Organization", this.organization);
  }

  settingsEdit(event:any) {
    this.logger.info(this, "settingsEdit");
    this.showModal(SettingsEditPage,
      { organization: this.organization,
        person: this.person });
  }

  settingsTypes(event:any) {
    this.logger.info(this, "settingsTypes");
    this.showModal(SettingsTypesPage,
      { organization: this.organization,
        person: this.person });
  }

  settingsRoles(event:any) {
    this.logger.info(this, "settingsRoles");
    this.showPage(SettingsRolesPage,
      { organization: this.organization,
        person: this.person });
  }

  settingsPayments(event:any) {
    this.logger.info(this, "settingsPayments");
    this.showPage(SettingsPaymentsPage,
      { organization: this.organization,
        person: this.person });
  }

  settingsRollcalls(event:any) {
    this.logger.info(this, "settingsRollcalls");
    this.showModal(SettingsRollcallsPage,
      { organization: this.organization,
        person: this.person });
  }

}
