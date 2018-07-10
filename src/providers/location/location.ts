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

import { Geolocation } from '@ionic-native/geolocation';
import { NativeGeocoder, NativeGeocoderReverseResult } from '@ionic-native/native-geocoder';

import { Location } from '../../models/location';

import { LoggerProvider } from '../../providers/logger/logger';

@Injectable()
export class LocationProvider {

  private key:string = "AIzaSyCLSlgNz3MtA4DlWenAAbc6UPFEZW4G2Po";
  private location:Location = null;

  constructor(
    private platform:Platform,
    private http:Http,
    private geolocation:Geolocation,
    private geocoder:NativeGeocoder,
    private logger:LoggerProvider) {
  }

  public detectLocation(cache:boolean=false):Promise<Location> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "detectLocation");
      if (cache && this.location) {
        resolve(this.location);
      }
      else if (this.platform.is("cordova")) {
        this.geolocation.getCurrentPosition().then((position:any) => {
          this.logger.info(this, "detectLocation", position);
          if (position && position.coords) {
            this.location = <Location>{
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            resolve(this.location);
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
            this.location = <Location>{
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            resolve(this.location);
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
        this.geocoder.reverseGeocode(location.latitude, location.longitude).then((results:NativeGeocoderReverseResult[]) => {
          this.logger.info(this, "loadAddress", location, results);
          if (results && results.length > 0) {
            let result = results[0];
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
          }
          else {
            reject("Address Not Found");
          }
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

  public searchAddress(address:string, limit:number=5, latitude:number=null, longitude:number=null):Promise<Location[]> {
    return new Promise((resolve, reject) => {
      let host = isDevMode() ? "/maps.googleapis.com" : "https://maps.googleapis.com";
      let url = `${host}/maps/api/place/autocomplete/json?input=${address}&types=geocode&key=${this.key}`;
      if (latitude && longitude) {
        url = url + `&location=${latitude},${longitude}`;
      }
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
          if (data && data.predictions) {
            let locations = [];
            for (let prediction of data.predictions.slice(0, limit)) {
              let location = <Location> {
                place: prediction.place_id,
                address: prediction.description
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
          resolve([]);
        });
    });
  }

  public placeDetails(location:Location):Promise<Location> {
    return new Promise((resolve, reject) => {
      if (location && location.place && location.place.length > 0) {
        let host = isDevMode() ? "/maps.googleapis.com" : "https://maps.googleapis.com";
        let url = `${host}/maps/api/place/details/json?placeid=${location.place}&key=${this.key}`;
        this.logger.info(this, "placeDetails", url);
        this.http.get(url, {})
          .timeout(12000)
          .map((response:any) => {
            return response.json();
          })
          .catch((error:any) => {
            return Observable.throw(error);
          })
          .subscribe((data:any) => {
            this.logger.info(this, "placeDetails", url, data);
            if (data && data.result) {
              let location = <Location>{
                place: data.result.place_id,
                address: data.result.formatted_address,
                latitude: data.result.geometry.location.lat,
                longitude: data.result.geometry.location.lng
              };
              resolve(location);
            }
            else {
              resolve(null);
            }
          },
          (error:any) => {
            this.logger.error(this, "placeDetails", url, error);
            resolve(null);
          });
      }
      else {
        resolve(null);
      }
    });
  }

}
