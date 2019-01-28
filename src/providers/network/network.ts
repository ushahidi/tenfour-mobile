import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { Observable } from "rxjs/Observable"
import 'rxjs/add/observable/of';

import { Network } from '@ionic-native/network';

import { LoggerProvider } from '../../providers/logger/logger';

@Injectable()
export class NetworkProvider {

  private TYPE_NONE:string = "none";
  private TYPE_UNKNOWN:string = "unknown";
  private TYPE_ETHERNET:string = "ethernet";
  private TYPE_WIFI:string = "wifi";
  private TYPE_2G:string = "2g";
  private TYPE_3G:string = "3g";
  private TYPE_4G:string = "4g";
  private TYPE_CELLULAR:string = "cellular";

  constructor(
    private platform:Platform,
    private network:Network,
    private logger:LoggerProvider) {

  }

  public onChanged():Observable<boolean> {
    if (this.platform.is("cordova")) {
      this.network.onConnect().subscribe(() => {
        this.logger.info(this, "subscribeNetwork", "Network Connected", this.network.type);
        return Observable.of(true);
      });
      this.network.onDisconnect().subscribe(() => {
        this.logger.info(this, "subscribeNetwork", "Network Disconnected", this.network.type);
        return Observable.of(false);
      });
      return Observable.of(this.network.type != this.TYPE_NONE);
    }
    else {
      return Observable.of(true);
    }
  }

  public onConnected():Observable<boolean> {
    if (this.platform.is("cordova")) {
      this.network.onConnect().subscribe(() => {
        this.logger.info(this, "subscribeNetwork", "Network Connected", this.network.type);
        return Observable.of(true);
      });
      return Observable.of(this.network.type != this.TYPE_NONE);
    }
    else {
      return Observable.of(true);
    }
  }

  public onDisconnected() {
    if (this.platform.is("cordova")) {
      this.network.onDisconnect().subscribe(() => {
        this.logger.info(this, "subscribeNetwork", "Network Disconnected", this.network.type);
        return Observable.of(false);
      });
      return Observable.of(this.network.type != this.TYPE_NONE);
    }
    else {
      return Observable.of(true);
    }
  }

}
