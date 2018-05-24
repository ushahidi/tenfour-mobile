import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Platform } from 'ionic-angular';
import 'rxjs/add/operator/map';

import { Sim } from '@ionic-native/sim';

import { Country } from '../../models/country';

import { LoggerProvider } from '../../providers/logger/logger';

@Injectable()
export class CountriesProvider {

  default:string = "US";
  file:string = "assets/data/countries.json";
  countries:Country[] = null;

  constructor(
    private platform:Platform,
    private http:Http,
    private sim:Sim,
    private logger:LoggerProvider) {
  }

  public getCountries(codes:string[]=null):Promise<Country[]> {
    return new Promise((resolve, reject) => {
      if (this.countries) {
        resolve(this.countries);
      }
      else {
        this.http.get(this.file)
          .map((res:Response) => res.json())
          .subscribe((data:any) => {
            this.logger.info(this, "getcountries", data);
            let countries = [];
            for (let _country of data) {
              if (codes == null || codes.indexOf(_country.code) != -1) {
                let country = new Country(_country);
                country.image = `assets/flags/${country.code.toLowerCase()}.png`;
                countries.push(country);
              }
            }
            this.countries = countries;
            resolve(countries);
          },
          (error:any) => {
            this.logger.error(this, "getcountries", error);
            this.countries = null;
            reject(error);
          });
      }
    });
  }

  public getDefaultCountry():Promise<Country> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.sim.getSimInfo().then((info:any) => {
          this.logger.info(this, "getDefaultCountry", info);
          this.getCountry(info.countryCode).then((country:Country) => {
            this.logger.info(this, "getDefaultCountry", info, "Country", country);
            resolve(country);
          },
          (error:any) => {
            this.logger.error(this, "getDefaultCountry", info, error);
            reject(error);
          });
        },
        (error:any) => {
          this.getCountry(this.default).then((country:Country) => {
            this.logger.info(this, "getDefaultCountry", "Country", country);
            resolve(country);
          },
          (error:any) => {
            this.logger.error(this, "getDefaultCountry", error);
            reject(error);
          });
        });
      }
      else {
        this.getCountry(this.default).then((country:Country) => {
          this.logger.info(this, "getDefaultCountry", "Country", country);
          resolve(country);
        },
        (error:any) => {
          this.logger.error(this, "getDefaultCountry", error);
          reject(error);
        });
      }
    });
  }

  public getCountry(countryCode:string):Promise<Country> {
    return new Promise((resolve, reject) => {
      if (countryCode && countryCode.length > 0) {
        this.getCountries().then((countries:Country[]) => {
          let country = countries.find(country => country.code.toUpperCase() === countryCode.toUpperCase());
          if (country) {
            this.logger.info(this, "getCountry", countryCode, country);
            resolve(country);
          }
          else {
            this.logger.error(this, "getCountry", countryCode, "Not Found");
            reject("Country Not Found");
          }
        });
      }
      else {
        reject("Invalid Country Code");
      }
    });
  }

}
