import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { SigninUrlPage } from '../../pages/signin-url/signin-url';
import { CheckinListPage } from '../../pages/checkin-list/checkin-list';

import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'SplashScreenPage',
  segment: 'loading'
})
@Component({
  selector: 'page-splash-screen',
  templateUrl: 'splash-screen.html',
  providers:[ StorageProvider ]
})
export class SplashScreenPage extends BasePage {

  private timer:any = null;

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

  ionViewDidEnter() {
    super.ionViewDidEnter();
    if (this.website) {
      this.timer = setTimeout(()=> {
        this.logger.warn(this, "Loading Timeout", "Redirecting...");
        Promise.all([this.hasOrganization(), this.hasUser()]).then(() => {
          this.showRootPage(CheckinListPage);
        })
        .catch((error) => {
          this.showRootPage(SigninUrlPage);
        });
      }, 5000);
    }
  }

  ionViewWillLeave() {
    super.ionViewWillLeave();
    clearTimeout(this.timer);
  }

  protected hasOrganization():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.storage.hasOrganization().then((hasOrganization:boolean) => {
        if (hasOrganization) {
          resolve(true);
        }
        else {
          reject("No organization");
        }
      });
    });
  }

  protected hasUser():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.storage.hasUser().then((hasUser:boolean) => {
        if (hasUser) {
          resolve(true);
        }
        else {
          reject("No user");
        }
      });
    });
  }

}
