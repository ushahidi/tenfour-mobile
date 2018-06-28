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
import { Region } from '../../models/region';
import { Country } from '../../models/country';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';
import { CountriesProvider } from '../../providers/countries/countries';

@IonicPage({
  name: 'SettingsRegionsPage',
  segment: 'settings/regions',
  defaultHistory: ['SettingsListPage']
})
@Component({
  selector: 'page-settings-regions',
  templateUrl: 'settings-regions.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ SettingsEditPage, SettingsRolesPage, SettingsPaymentsPage, SettingsChannelsPage ]
})
export class SettingsRegionsPage extends BasePrivatePage {

  loading:boolean = false;

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
      protected countries:CountriesProvider) {
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
    this.loading = true;
    return Promise.resolve()
      .then(() => { return this.loadOrganization(cache); })
      .then(() => { return this.loadUser(cache); })
      .then(() => { return this.loadRegions(cache); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Loaded");
        if (event) {
          event.complete();
        }
        this.loading = false;
      })
      .catch((error) => {
        this.logger.error(this, "loadUpdates", "Failed", error);
        if (event) {
          event.complete();
        }
        this.loading = false;
        this.showToast(error);
      });
  }

  private loadRegions(cache:boolean=true, event:any=null):Promise<Region[]> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadRegions");
      if (cache) {
        this.storage.getCountries(this.organization).then((countries:Country[]) => {
          if (countries && countries.length > 0) {
            this.organization.countries = countries;
            if (event) {
              event.complete();
            }
            resolve([]);
          }
          else {
            this.loadRegions(false, event).then((regions:Region[]) => {
              if (event) {
                event.complete();
              }
              resolve(regions);
            });
          }
        },
        (error:any) => {
          this.loadRegions(false, event).then((regions:Region[]) => {
            if (event) {
              event.complete();
            }
            resolve(regions);
          });
        });
      }
      else {
        this.api.getRegions(this.organization).then((regions:Region[]) => {
          let codes = regions.map(region => region.code);
          this.countries.getCountries(codes).then((countries:Country[]) => {
            this.storage.saveCountries(this.organization, countries).then((saved:boolean) => {
              this.organization.countries = countries;
              if (event) {
                event.complete();
              }
              resolve(regions);
            },
            (error:any) => {
              this.organization.countries = countries;
              if (event) {
                event.complete();
              }
              resolve(regions);
            });
          });
        },
        (error:any) => {
          this.organization.countries = [];
          if (event) {
            event.complete();
          }
          reject(error);
        });
      }
    });
  }

  private cancelEdit(event:any) {
    this.hideModal();
  }

  private doneEdit(event:any) {
    let loading = this.showLoading("Updating...", true);
    let saves = [];
    let regions = [];
    let codes = [];
    for (let country of this.organization.countries) {
      if (country.selected) {
        codes.push(country.country_code);
        regions.push(country.code);
      }
      saves.push(this.storage.saveCountry(this.organization, country));
    }
    this.organization.codes = Array.from(new Set(codes)).sort().join(",");
    this.organization.regions = Array.from(new Set(regions)).sort().join(",");
    Promise.all(saves).then(saved => {
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
    });
  }

}
