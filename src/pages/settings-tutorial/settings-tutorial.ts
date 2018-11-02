import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';
import { CheckinEditPage } from '../../pages/checkin-edit/checkin-edit';
import { CheckinTestPage } from '../../pages/checkin-test/checkin-test';
import { PersonEditPage } from '../../pages/person-edit/person-edit';
import { GroupEditPage } from '../../pages/group-edit/group-edit';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';
import { Group } from '../../models/group';

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
  entryComponents:[ CheckinTestPage, CheckinEditPage, PersonEditPage, GroupEditPage ]
})

export class SettingsTutorialPage extends BasePrivatePage {

  loading:boolean = false;
  tutorial:string = "checkins";

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

  private createCheckin(event:any) {
    let modal = this.showModal(CheckinEditPage, {
      organization: this.organization,
      user: this.user
    });
    modal.onDidDismiss(data => {
      this.logger.info(this, "createCheckin", "Modal", data);
    });
  }

  private testCheckin(event:any) {
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

  private addPerson() {
    this.logger.info(this, "addPerson");
    let modal = this.showModal(PersonEditPage, {
      organization: this.organization,
      user: this.user
    });
    modal.onDidDismiss(data => {
      this.logger.info(this, "addPerson", "Modal", data);
    });
  }

  private createGroup(event:any) {
    this.logger.info(this, "createGroup");
    let modal = this.showModal(GroupEditPage, {
      organization: this.organization,
      person: this.user
    });
    modal.onDidDismiss((data:any) => {
      this.logger.info(this, "createGroup", data);
    });
  }

  protected editProfile(event:any) {
    this.logger.info(this, "editProfile");
    let modal = this.showModal(PersonEditPage, {
      organization: this.organization,
      user: this.user,
      person: this.user,
      person_id: this.user.id,
      profile: true
    });
    modal.onDidDismiss((data:any) => {
      this.logger.info(this, "editProfile", "Modal", data);
    });
  }

}
