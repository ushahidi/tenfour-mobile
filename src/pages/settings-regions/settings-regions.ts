import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { ApiProvider } from '../../providers/api/api';
import { DatabaseProvider } from '../../providers/database/database';
import { CountryProvider } from '../../providers/country/country';

import { BasePage } from '../../pages/base-page/base-page';
import { SettingsEditPage } from '../../pages/settings-edit/settings-edit';
import { SettingsRolesPage } from '../../pages/settings-roles/settings-roles';
import { SettingsPaymentsPage } from '../../pages/settings-payments/settings-payments';
import { SettingsCheckinsPage } from '../../pages/settings-checkins/settings-checkins';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Region } from '../../models/region';
import { Country } from '../../models/country';

@IonicPage({
  segment: 'settings/regions',
  defaultHistory: ['settings']
})
@Component({
  selector: 'page-settings-regions',
  templateUrl: 'settings-regions.html',
  providers: [ ApiProvider ],
  entryComponents:[ SettingsEditPage, SettingsRolesPage, SettingsPaymentsPage, SettingsCheckinsPage ]
})
export class SettingsRegionsPage extends BasePage {

  organization:Organization = null;
  person:Person = null;

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
      protected database:DatabaseProvider,
      protected countries:CountryProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.person = this.getParameter<Person>("person");
    let loading = this.showLoading("Loading...");
    this.loadRegions(true).then((loaded:any) => {
      loading.dismiss();
    },
    (error:any) => {
      loading.dismiss();
      this.showToast(error);
    });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.trackPage({
      organization: this.organization.name
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
