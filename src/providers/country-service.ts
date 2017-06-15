import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';

import { Country } from '../models/country';

import { LoggerService } from '../providers/logger-service';

@Injectable()
export class CountryService {

  file:string = "assets/countries/codes.json";
  countries:Country[] = null;

  constructor(
    private http:Http,
    private logger:LoggerService) {
  }

  getCodes():Promise<Country[]> {
    return new Promise((resolve, reject) => {
      if (this.countries) {
        resolve(this.countries);
      }
      else {
        this.http.get(this.file)
          .map((res:Response) => res.json())
          .subscribe(
            (data:any) => {
              this.logger.info(this, "getCodes", data);
              let countries = [];
              for (let _country of data) {
                let country = <Country>_country;
                countries.push(country);
              }
              this.countries = countries;
              resolve(countries);
            },
            (error:any) => {
              this.logger.error(this, "getCodes", error);
              this.countries = null;
              reject(error);
            }
          );
      }
    });
  }

  getCode(countryCode:string):Promise<Country> {
    return new Promise((resolve, reject) => {
      if (countryCode && countryCode.length > 0) {
        this.getCodes().then((countries:Country[]) => {
          let country = countries.find(country => country.code.toUpperCase() === countryCode.toUpperCase());
          if (country) {
            this.logger.info(this, "getCode", countryCode, country);
            resolve(country);
          }
          else {
            this.logger.error(this, "getCode", countryCode, "Not Found");
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
