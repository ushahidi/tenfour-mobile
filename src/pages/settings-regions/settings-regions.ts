import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
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
import { DatabaseProvider } from '../../providers/database/database';
import { CountryProvider } from '../../providers/country/country';

@IonicPage({
  name: 'SettingsRegionsPage',
  segment: 'settings/regions',
  defaultHistory: ['SettingsListPage']
})
@Component({
  selector: 'page-settings-regions',
  templateUrl: 'settings-regions.html',
  providers: [ ApiProvider ],
  entryComponents:[ SettingsEditPage, SettingsRolesPage, SettingsPaymentsPage, SettingsChannelsPage ]
})
export class SettingsRegionsPage extends BasePage {

  organization:Organization = null;
  user:User = null;

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
      protected database:DatabaseProvider,
      protected countries:CountryProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    let loading = this.showLoading("Loading...");
    this.loadUpdates(true).then((loaded:any) => {
      loading.dismiss();
    },
    (error:any) => {
      loading.dismiss();
      this.showToast(error);
    });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    if (this.organization) {
      this.trackPage({
        organization: this.organization.name
      });
    }
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    return Promise.resolve()
      .then(() => { return this.loadOrganization(cache); })
      .then(() => { return this.loadUser(cache); })
      .then(() => { return this.loadRegions(cache); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Done");
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

  private loadRegions(cache:boolean=true, event:any=null):Promise<Region[]> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadRegions");
      if (cache && this.mobile) {
        this.database.getCountries(this.organization).then((countries:Country[]) => {
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
            if (this.mobile) {
              this.database.saveCountries(this.organization, countries).then((saved:boolean) => {
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
            }
            else {
              this.organization.countries = countries;
              if (event) {
                event.complete();
              }
              resolve(regions);
            }
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
    let loading = this.showLoading("Updating...");
    let saves = [];
    let regions = [];
    let codes = [];
    for (let country of this.organization.countries) {
      if (country.selected) {
        codes.push(country.country_code);
        regions.push(country.code);
      }
      saves.push(this.database.saveCountry(this.organization, country));
    }
    this.organization.codes = Array.from(new Set(codes)).sort().join(",");
    this.organization.regions = Array.from(new Set(regions)).sort().join(",");
    Promise.all(saves).then(saved => {
      this.api.updateOrganization(this.organization).then((organization:Organization) => {
        if (this.mobile) {
          this.database.saveOrganization(organization).then(saved => {
            loading.dismiss();
            this.hideModal({
              organization: organization
            });
          });
        }
        else {
          loading.dismiss();
          this.hideModal({
            organization: organization
          });
        }
      },
      (error:any) => {
        loading.dismiss();
        this.showAlert("Problem Updating Organization", error);
      });
    });
  }

}
