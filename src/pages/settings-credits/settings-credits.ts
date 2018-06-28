import { Component, NgZone } from '@angular/core';
import { IonicPage, Events, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';

import { Subscription } from '../../models/subscription';
import { Organization } from '../../models/organization';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage()
@Component({
  selector: 'page-settings-credits',
  templateUrl: 'settings-credits.html',
})
export class SettingsCreditsPage  extends BasePrivatePage {

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
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.credits = this.getParameter<number>("credits");
    this.billingEstimate = this.getParameter<number>("billingEstimate");
    this.organization = this.getParameter<Organization>("organization");
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    if (this.organization) {
      this.analytics.trackPage(this, {
        organization: this.organization.name
      });
    }
  }

  private closeModal(event:any) {
    this.hideModal();
  }

  private doneAdd(event:any) {
    let loading = this.showLoading("Updating...", true);
    this.organization.credits_extra = this.credits;
    this.api.updateOrganization(this.organization).then((organization:Organization) => {
      this.storage.saveOrganization(organization).then(saved => {
        loading.dismiss();
        this.showToast(this.credits + ' extra credits have been added to your plan');
        this.hideModal({
          organization: organization
        });
      });
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem adding credits", error);
    });
  }

}
