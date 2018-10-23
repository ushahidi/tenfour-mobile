import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';
import { CheckinTestModule } from '../../pages/checkin-test/checkin-test.module';
import { CheckinListModule } from '../../pages/checkin-list/checkin-list.module';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'SettingsTutorialPage',
  segment: 'settings/tutorial',
  defaultHistory: ['SettingsListPage']
})
@Component({
  selector: 'page-settings-tutorial',
  templateUrl: 'settings-tutorial.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ CheckinTestPage, CheckinListPage ]
})

export class SettingsTutorialPage extends BasePrivatePage {

  loading:boolean = false;

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
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
    let loading = this.showLoading("Loading...");
    this.loadUpdates(false).then((loaded:any) => {
      loading.dismiss();
    });
  }
  ionViewDidEnter() {
    super.ionViewDidEnter();
    if (this.organization) {
      this.analytics.trackPage(this, {
        organization: this.organization.name
      });
    }
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    return Promise.resolve()
      .then(() => { return this.loadOrganization(cache); })
      .then(() => { return this.loadUser(cache); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Loaded");
        if (event) {
          event.complete();
        }
      })
      .catch((error) => {
        this.logger.error(this, "loadUpdates", "Failed", error);
        if (event) {
          event.complete();
        }
        this.showToast(error);
      });
  }

  private taskSendCheckin(event:any) {
    this.logger.info(this, "taskSendCheckin");
    let modal = this.showModal(CheckinTestPage, {
      organization: this.organization,
      user: this.user
    });
    modal.onDidDismiss(data => {
      this.logger.info(this, "taskSendCheckin", "Modal", data);
      if (data) {
        this.user.config_self_test_sent = true;
      }
      else {
        this.user.config_self_test_sent = false;
      }
    });
  }

  private skipAhead(event:any) {
    this.logger.info(this, "skipAhead");
    this.showRootPage(CheckinListPage, {
      organization: this.organization,
      user: this.user
    });
  }

}
