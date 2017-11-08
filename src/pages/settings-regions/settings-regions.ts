import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';
import { CountryService } from '../../providers/country-service';

import { BasePage } from '../../pages/base-page/base-page';
import { SettingsEditPage } from '../../pages/settings-edit/settings-edit';
import { SettingsRolesPage } from '../../pages/settings-roles/settings-roles';
import { SettingsPaymentsPage } from '../../pages/settings-payments/settings-payments';
import { SettingsRollcallsPage } from '../../pages/settings-rollcalls/settings-rollcalls';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Region } from '../../models/region';
import { Country } from '../../models/country';

@IonicPage()
@Component({
  selector: 'page-settings-regions',
  templateUrl: 'settings-regions.html',
  providers: [ ApiService ],
  entryComponents:[ SettingsEditPage, SettingsRolesPage, SettingsPaymentsPage, SettingsRollcallsPage ]
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
      protected api:ApiService,
      protected database:DatabaseService,
      protected countries:CountryService) {
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
      if (cache) {
        this.database.getCountries(this.organization).then((countries:Country[]) => {
          if (countries && countries.length > 0) {
            this.organization.countries = countries;
            if (event) {
              event.complete();
            }
            resolve(countries);
          }
          else {
            this.loadRegions(false, event).then((regions:Region[]) => {
              if (event) {
                event.complete();
              }
              resolve(regions);
            });
          }
        });
      }
      else {
        this.api.getRegions(this.organization).then((regions:Region[]) => {
          let codes = regions.map(region => region.code);
          this.countries.getCountries(codes).then((countries:Country[]) => {
            let saves = [];
            for (let country of countries) {
              if (this.organization.regions) {
                let codes = this.organization.regions.split(",");
                country.selected = codes.indexOf(country.code) != -1;
              }
              else {
                country.selected = false;
              }
              saves.push(this.database.saveCountry(this.organization, country));
            }
            Promise.all(saves).then(saved => {
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
    let loading = this.showLoading("Updating...");
    let saves = [];
    let regions = [];
    for (let country of this.organization.countries) {
      if (country.selected) {
        regions.push(country.code);
      }
      saves.push(this.database.saveCountry(this.organization, country));
    }
    this.organization.regions = regions.join(",");
    Promise.all(saves).then(saved => {
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
    });
  }

  // compare(a,b) {
  //   if (a.name.common < b.name.common)
  //     return -1;
  //   if (a.name.common > b.name.common)
  //     return 1;
  //   return 0;
  // }
  //
  // loadCountries() {
  //   let url = "https://raw.githubusercontent.com/mledoze/countries/master/countries.json";
  //   this.http.get(url)
  //     .map(res => res.json())
  //     .subscribe(
  //       (items:any) => {
  //         let sorted = items.sort(this.compare);
  //         let countries = [];
  //         let index = 1;
  //         for (let item of sorted) {
  //           countries.push({
  //             id: index,
  //             code: item.cca2,
  //             name: item.name.common,
  //             country_code: Number(item.callingCode[0])});
  //             index = index + 1;
  //         }
  //         this.logger.info(this, "loadCountries", countries);
  //       },
  //       (error:any) => {
  //         this.logger.error(this, "loadCountries", url, error);
  //       });
  // }

}
