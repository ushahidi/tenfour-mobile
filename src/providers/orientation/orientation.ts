import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { Observable } from "rxjs/Observable"
import 'rxjs/add/observable/of';

import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { LoggerProvider } from '../../providers/logger/logger';

@Injectable()
export class OrientationProvider {

  constructor(
    private platform:Platform,
    private orientation:ScreenOrientation,
    private logger:LoggerProvider) {
  }

  public onChanged():Observable<string> {
    if (this.platform.is("cordova")) {
      this.orientation.unlock();
      this.orientation.onChange().subscribe(() => {
        this.logger.info(this, "Orientation", this.orientation.type);
        return Observable.of(this.orientation.type);
      });
      return Observable.of(this.orientation.type);
    }
    return Observable.of("landscape");
  }

}
