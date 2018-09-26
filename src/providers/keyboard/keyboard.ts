import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { Keyboard } from '@ionic-native/keyboard';

import { LoggerProvider } from '../../providers/logger/logger';

@Injectable()
export class KeyboardProvider {

  constructor(
    private platform:Platform,
    private keyboard:Keyboard,
    private logger:LoggerProvider) {

  }

  public show() {
    if (this.platform.is("cordova") && this.keyboard && this.keyboard.hasOwnProperty('show') && typeof this.keyboard.show === 'function') {
      this.keyboard.show();
    }
  }

  public hide() {
    if (this.platform.is("cordova") && this.keyboard && this.keyboard.hasOwnProperty('close') && typeof this.keyboard.close === 'function') {
      this.keyboard.close();
    }
  }

}
