import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { BasePage } from '../../pages/base-page/base-page';
import { SettingsEditPage } from '../../pages/settings-edit/settings-edit';
import { SettingsRolesPage } from '../../pages/settings-roles/settings-roles';
import { SettingsPaymentsPage } from '../../pages/settings-payments/settings-payments';
import { SettingsCheckinsPage } from '../../pages/settings-checkins/settings-checkins';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';

@IonicPage()
@Component({
  selector: 'page-settings-sizes',
  templateUrl: 'settings-sizes.html',
  providers: [ ApiService ],
  entryComponents:[ SettingsEditPage, SettingsRolesPage, SettingsPaymentsPage, SettingsCheckinsPage ]
})
export class SettingsSizesPage extends BasePage {

  organization:Organization = null;
  person:Person = null;
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
      protected api:ApiService,
      protected database:DatabaseService) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.person = this.getParameter<Person>("person");
    this.logger.info(this, "ionViewWillEnter", "Size", this.organization.size);
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.trackPage({
      organization: this.organization.name
    });
  }

  private cancelEdit(event:any) {
    this.hideModal();
  }

  private doneEdit(event:any) {
    this.logger.info(this, "doneEdit", "Size", this.organization.size)
    let loading = this.showLoading("Updating...");
    this.api.updateOrganization(this.organization).then((organization:Organization) => {
      this.database.saveOrganization(organization).then(saved => {
        loading.dismiss();
        this.hideModal({ organization: organization });
      });
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Updating Organization", error);
    });
  }

}
