import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiProvider } from '../../providers/api/api';
import { DatabaseProvider } from '../../providers/database/database';

import { Organization } from '../../models/organization';

@IonicPage({
  segment: 'settings/checkins',
  defaultHistory: ['settings']
})
@Component({
  selector: 'page-settings-checkins',
  templateUrl: 'settings-checkins.html',
  providers: [ ApiProvider, DatabaseProvider ],
  entryComponents:[  ]
})
export class SettingsCheckinsPage extends BasePage {

  website:string = "https://app.tenfour.org";
  organization:Organization = null;
  help:string = "https://www.tenfour.org/support/configuring-how-to-send-checkins";

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

  private cancelEdit(event:any) {
    this.hideModal();
  }

  private doneEdit(event:any) {
    let loading = this.showLoading("Updating...");
    this.api.updateOrganization(this.organization).then((organization:Organization) => {
      if (this.mobile) {
        this.database.saveOrganization(organization).then(saved => {
          loading.dismiss();
          this.hideModal({
            organization: organization
          });
        });
      }
      else {
        loading.dismiss();
        this.hideModal({
          organization: organization
        });
      }
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Updating Organization", error);
    });
  }

  private onAppOnly(event:any) {
    this.logger.info(this, "onAppOnly", this.organization.app_enabled);
    if (this.organization.app_enabled) {
      this.organization.email_enabled = false;
      this.organization.sms_enabled = false;
      this.organization.twitter_enabled = false;
      this.organization.slack_enabled = false;
    }
  }

  private onEmailEnabled(event:any) {
    this.logger.info(this, "onEmailEnabled", this.organization.email_enabled);
    if (this.organization.email_enabled) {
      this.organization.app_enabled = false;
    }
  }

  private onSmsEnabled(event:any) {
    this.logger.info(this, "onSmsEnabled", this.organization.sms_enabled);
    if (this.organization.sms_enabled) {
      this.organization.app_enabled = false;
    }
  }

  private onSlackEnabled(event:any) {
    this.logger.info(this, "onSlackEnabled", this.organization.slack_enabled);
    if (this.organization.slack_enabled) {
      this.organization.app_enabled = false;
    }
  }

}
