import { Component, ViewChild, NgZone } from '@angular/core';
import { Content, Platform, NavParams, Alert, AlertController, Toast, ToastController, Modal, ModalController, Loading, LoadingController, ActionSheet, ActionSheetController, NavController, ViewController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';

import { StorageProvider } from '../../providers/storage/storage';

@Component({
  selector: 'base-public-page',
  template: "<ion-header></ion-header><ion-content></ion-content>",
  providers: [ StorageProvider ]
})
export class BasePublicPage extends BasePage {

  constructor(
      protected zone:NgZone,
      protected platform:Platform,
      protected navParams:NavParams,
      protected navController:NavController,
      protected viewController:ViewController,
      protected modalController:ModalController,
      protected toastController:ToastController,
      protected alertController:AlertController,
      protected loadingController:LoadingController,
      protected actionController:ActionSheetController,
      protected storage:StorageProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewCanEnter():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.storage.hasUser().then((hasUser:boolean) => {
        if (hasUser) {
          this.logger.error(this, "ionViewCanEnter", "NO");
          resolve(false);
        }
        else {
          this.logger.info(this, "ionViewCanEnter", "YES");
          resolve(true);
        }
      });
    });
  }

}
