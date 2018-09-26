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
    if (this.platform.is("cordova")) {
      this.keyboard.show();
    }
  }

  public hide() {
    if (this.platform.is("cordova")) {
      this.keyboard.close();
    }
  }

}
