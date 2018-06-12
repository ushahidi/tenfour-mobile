import { Injectable } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';

import { Observable } from "rxjs/Observable"
import 'rxjs/add/observable/of';

import { Deeplinks } from '@ionic-native/deeplinks';

import { Deeplink } from '../../models/deeplink';

import { LoggerProvider } from '../../providers/logger/logger';

@Injectable()
export class DeeplinksProvider {

  constructor(
    private platform:Platform,
    private deeplinks:Deeplinks,
    private logger:LoggerProvider) {

  }

  public onMatch(navController:NavController):Observable<Deeplink> {
    if (this.platform.is("cordova")) {
      this.deeplinks.routeWithNavController(navController, {}).subscribe(
        (match:any) => {
          let deeplink = <Deeplink> {
            path: match['$link']['path'],
            parameters: this.getParameters(match['$link']['queryString'])
          };
          this.logger.info(this, "onMatch", "Match", match, deeplink);
          return Observable.of(deeplink);
        },
        (nomatch:any) => {
          this.logger.info(this, "onMatch", "No Match", nomatch);
        });
    }
    return Observable.of(null);
  }

  private getParameters(query:string) {
    let parameters = {};
    if (query && query.length > 0) {
      query.split("&").forEach((parts) => {
        let items = parts.split("=");
        if (items && items.length >= 2) {
          parameters[items[0]] = decodeURIComponent(items[1]);
        }
      });
    }
    return parameters;
  }

}
