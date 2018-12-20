import { Component, NgZone, ViewChild } from '@angular/core';
import { App, IonicPage, Platform, TextInput, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController, PopoverController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';
import { SettingsPaymentsPage } from '../../pages/settings-payments/settings-payments';

import { Checkin } from '../../models/checkin';
import { Organization } from '../../models/organization';
import { User } from '../../models/user';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

import { ColorPickerComponent } from '../../components/color-picker/color-picker';

@IonicPage({
  name: 'CheckinChannelsPage',
  segment: 'checkins/channels',
  defaultHistory: ['CheckinSendPage']
})
@Component({
  selector: 'page-checkin-channels',
  templateUrl: 'checkin-channels.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[  ]
})
export class CheckinChannelsPage extends BasePrivatePage {

  email_enabled:boolean=false;
  email_selected:boolean=false;

  sms_enabled:boolean=false;
  sms_selected:boolean=false;

  slack_enabled:boolean=false;
  slack_selected:boolean=false;

  app_enabled:boolean=false;
  app_selected:boolean=false;

  voice_enabled:boolean=false;
  voice_selected:boolean=false;

  checkin:Checkin = null;
  organization:Organization = null;
  user:User = null;

  constructor(
      protected appController:App,
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
      protected popoverController:PopoverController,
      protected api:ApiProvider,
      protected storage:StorageProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();

    this.checkin = this.getParameter<Checkin>("checkin");
    this.organization = this.getParameter<Organization>("organization");
    this.user = this.getParameter<User>("user");

    if (this.organization.hasFreePlan()) {
      this.app_enabled = this.organization.app_enabled;
    } else {
      this.app_enabled =  this.organization.app_enabled;
      this.email_enabled = this.organization.email_enabled;
      this.sms_enabled = this.organization.sms_enabled;
      this.slack_enabled = this.organization.slack_enabled;
      this.voice_enabled = this.organization.voice_enabled;
    }

    if (this.checkin.sendVia().length) {
      let values = this.checkin.sendVia();
      this.email_selected = values.indexOf('email') != -1;
      this.sms_selected = values.indexOf('sms') != -1;
      this.slack_selected = values.indexOf('slack') != -1;
      this.app_selected = values.indexOf('app') != -1;
      this.voice_selected = values.indexOf('voice') != -1;
    }
  }

  private done() {
    let send_via = [];
    if (this.email_enabled && this.email_selected) {
      send_via.push('email');
    }
    if (this.sms_enabled && this.sms_selected) {
      send_via.push('sms');
    }
    if (this.slack_enabled && this.slack_selected) {
      send_via.push('slack');
    }
    if (this.app_selected) {
      send_via.push('app');
    }
    if (this.voice_enabled && this.voice_selected) {
      send_via.push('voice');
    }
    this.checkin.send_via = send_via.join(',');

    this.logger.info(this, 'done', this.checkin.send_via);

    this.hideModal();
  }

  private upgradeToPro(event:any) {
    this.logger.info(this, "upgradeToPro");
    if (this.ios) {
      let alert = this.showAlert("Visit Website", "Please login to the website to upgrade to TenFour Pro.");
      alert.onDidDismiss(data => {
        this.showUrl("https://app.tenfour.org", "_blank");
      });
    }
    else {
      this.showModalOrPage(SettingsPaymentsPage, {
        organization: this.organization,
        user: this.user
      });
    }
  }
}
