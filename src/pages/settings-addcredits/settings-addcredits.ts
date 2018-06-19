import { Component, NgZone } from '@angular/core';
import { IonicPage, Events, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { Subscription } from '../../models/subscription';
import { Organization } from '../../models/organization';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';


@IonicPage()
@Component({
  selector: 'page-settings-addcredits',
  templateUrl: 'settings-addcredits.html',
})
export class SettingsAddcreditsPage  extends BasePage {

  credits:number = 0;
  billingEstimate:number = 0;

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
      protected storage:StorageProvider,
      protected events:Events) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    this.credits = this.getParameter<number>("credits");
    this.billingEstimate = this.getParameter<number>("billingEstimate");
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    // if (this.organization) {
    //   this.analytics.trackPage(this, {
    //     organization: this.organization.name
    //   });
    // }
  }

  private closeModal(event:any) {
    this.hideModal();
  }

}
