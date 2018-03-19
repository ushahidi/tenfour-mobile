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
  selector: 'page-settings-types',
  templateUrl: 'settings-types.html',
  providers: [ ApiService ],
  entryComponents:[ SettingsEditPage, SettingsRolesPage, SettingsPaymentsPage, SettingsCheckinsPage ]
})
export class SettingsTypesPage extends BasePage {

  organization:Organization = null;
  person:Person = null;
  types:any = [
    { name: 'Advocacy', key: "advocacy", selected: false },
    { name: 'Anti-Corruption & Transparency', key: "anticorruption", selected: false },
    { name: 'Community Organizing', key: "community", selected: false },
    { name: 'Education', key: "education", selected: false },
    { name: 'Election Monitoring', key: "election", selected: false },
    { name: 'Environmental Monitoring', key: "environmental", selected: false },
    { name: 'First Responders', key: "firstresponders", selected: false },
    { name: 'Government', key: "government", selected: false },
    { name: 'Human Rights', key: "humanrights", selected: false },
    { name: 'Humanitarian & Crisis Response', key: "humanitarian", selected: false },
    { name: 'International Development', key: "internationaldevelopment", selected: false },
    { name: 'Marketing', key: "marketing", selected: false },
    { name: 'Media and Journalism', key: "mediaandjournalism", selected: false },
    { name: 'Research', key: "research", selected: false },
    { name: 'Service Delivery', key: "servicedelivery", selected: false },
    { name: 'Philanthropy', key: "philanthropy", selected: false },
    { name: 'Other', key: "other", selected: false }];

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
    if (this.organization.types) {
      let selected:string[] = this.organization.types.split(",");
      for (let type of this.types) {
        type.selected = selected.indexOf(type.key) > -1;
      }
    }
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
    let selected = [];
    for (let type of this.types) {
      if (type.selected == true) {
        selected.push(type.key);
      }
    }
    this.organization.types = selected.join(",");
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
