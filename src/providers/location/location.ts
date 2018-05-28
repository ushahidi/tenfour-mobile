import { HttpClient } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { Platform } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/throw';

import { Http, Headers, URLSearchParams, RequestOptions, Response } from '@angular/http';
import { GoogleMapsAPIWrapper } from 'angular2-google-maps/core';

import { Geolocation } from '@ionic-native/geolocation';
import { NativeGeocoder, NativeGeocoderReverseResult } from '@ionic-native/native-geocoder';

import { Location } from '../../models/location';

import { LoggerProvider } from '../../providers/logger/logger';

@Injectable()
export class LocationProvider {

  private key:string = "AIzaSyCLSlgNz3MtA4DlWenAAbc6UPFEZW4G2Po";

  constructor(
    private platform:Platform,
    private http:Http,
    private geolocation:Geolocation,
    private geocoder:NativeGeocoder,
    private logger:LoggerProvider) {
  }

  public detectLocation():Promise<Location> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "detectLocation");
      if (this.platform.is("cordova")) {
        this.geolocation.getCurrentPosition().then((position:any) => {
          this.logger.info(this, "detectLocation", position);
          if (position && position.coords) {
            let location = <Location>{
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            resolve(location);
          }
          else {
            reject(null);
          }
        }).catch((error:any) => {
          this.logger.error(this, "detectLocation", error);
          reject(null);
        });
      }
      else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position:any) => {
          this.logger.info(this, "detectLocation", position);
          if (position) {
            let location = <Location>{
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            resolve(location);
          }
          else {
            reject("Location Not Supported");
          }
        },
        (error:any) => {
          reject(error);
        });
      }
      else {
        reject("Location Not Supported");
      }
    });
  }

  public lookupAddress(location:Location):Promise<string> {
    return new Promise((resolve, reject) => {
        this.logger.info(this, "loadAddress");
      if (this.platform.is("cordova")) {
        this.geocoder.reverseGeocode(location.latitude, location.longitude).then((result:NativeGeocoderReverseResult) => {
          this.logger.info(this, "loadAddress", location, result);
          let address:any[] = [];
          if (result.thoroughfare) {
            address.push(result.thoroughfare);
          }
          if (result.locality) {
            address.push(result.locality);
          }
          if (result.administrativeArea) {
            address.push(result.administrativeArea);
          }
          if (result.countryName) {
            address.push(result.countryName);
          }
          this.logger.info(this, "loadAddress", location, address);
          resolve(address.join(", "));
        })
        .catch((error:any) => {
          this.logger.error(this, "loadAddress", location, error);
          reject(error);
        });
      }
      else {
        let latitude = location.latitude;
        let longitude = location.longitude;
        let host = isDevMode() ? "/maps.googleapis.com" : "https://maps.googleapis.com";
        let url = `${host}/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.key}`;
        this.logger.info(this, "loadAddress", url);
        this.http.get(url, {})
          .timeout(12000)
          .map(res => res.json())
          .catch((error:any) => {
            this.logger.error(this, "loadAddress", error);
            return Observable.throw(error );
          })
          .subscribe((data:any) => {
            this.logger.info(this, "loadAddress", url, data);
            if (data && data.results) {
              let result = data.results[0];
              resolve(result.formatted_address);
            }
            else {
              reject("Address Lookup ")
            }
          },
          (error:any) => {
            this.logger.error(this, "loadAddress", url, error);
            reject(error);
          });
      }
    });
  }

  public searchAddress(address:string, limit:number=5):Promise<Location[]> {
    return new Promise((resolve, reject) => {
      let host = isDevMode() ? "/maps.googleapis.com" : "https://maps.googleapis.com";
      let url = `${host}/maps/api/place/textsearch/json?query=${address}&key=${this.key}`;
      this.logger.info(this, "searchAddress", url);
      this.http.get(url, {})
        .timeout(12000)
        .map((response:any) => {
          return response.json();
        })
        .catch((error:any) => {
          return Observable.throw(error);
        })
        .subscribe((data:any) => {
          this.logger.info(this, "searchAddress", url, data);
          if (data && data.results) {
            let locations = [];
            for (let result of data.results.slice(0, limit)) {
              let location = <Location> {
                address: result.name || result.formatted_address,
                latitude: result.geometry.location.lat,
                longitude: result.geometry.location.lng
              };
              locations.push(location);
            }
            resolve(locations);
          }
          else {
            resolve([]);
          }
        },
        (error:any) => {
          this.logger.error(this, "searchAddress", url, error);
          reject(error);
        });
    });
  }

}
