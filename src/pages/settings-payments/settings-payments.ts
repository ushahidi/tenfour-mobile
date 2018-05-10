import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiProvider } from '../../providers/api/api';
import { DatabaseProvider } from '../../providers/database/database';

import { Organization } from '../../models/organization';

@IonicPage()
@Component({
  selector: 'page-settings-payments',
  templateUrl: 'settings-payments.html',
  providers: [ ApiProvider, DatabaseProvider ],
  entryComponents:[  ]
})
export class SettingsPaymentsPage extends BasePage {

  organization:Organization = null;
  website:string = "https://app.tenfour.org/settings/plan-and-credits";

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
      protected api:ApiProvider,
      protected database:DatabaseProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.trackPage({
      organization: this.organization.name
    });
  }

}
