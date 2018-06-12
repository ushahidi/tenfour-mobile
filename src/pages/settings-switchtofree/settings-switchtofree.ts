import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { Subscription } from '../../models/subscription';
import { Organization } from '../../models/organization';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage()
@Component({
  selector: 'page-settings-switchtofree',
  templateUrl: 'settings-switchtofree.html',
})
export class SettingsSwitchtofreePage extends BasePage {

  organization:Organization = null;

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
      protected storage:StorageProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsSwitchtofreePage');

    this.storage.getOrganization().then((organization:Organization) => {
      this.organization = organization;
    });
  }

  private closeModal(event:any) {
    this.hideModal();
  }

  private switchToFree(event:any) {
    this.logger.info(this, "switchToFree");
    let loading = this.showLoading("Switching to Free Plan...", true);
    this.api.deleteSubscription(this.organization).then((subscription:Subscription) => {
      loading.dismiss();
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Switching to Free Plan", error);
    });
  }

}
