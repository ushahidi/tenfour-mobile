import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { Keyboard } from '@ionic-native/keyboard';

@Injectable()
export class KeyboardProvider {

  constructor(
    private platform:Platform,
    private keyboard:Keyboard) {

  }

  public show():Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.keyboard.show();
        resolve(true);
      }
      else {
        resolve(false);
      }
    });
  }

  public hide():Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.keyboard.hide();
        resolve(true);
      }
      else {
        resolve(false);
      }
    });
  }

}
