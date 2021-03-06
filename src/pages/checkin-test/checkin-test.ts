import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';
import { Checkin } from '../../models/checkin';
import { Recipient } from '../../models/recipient';
import { Answer } from '../../models/answer';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'CheckinTestPage',
  segment: 'checkins/test',
  defaultHistory: ['CheckinListPage']
})
@Component({
  selector: 'page-checkin-test',
  templateUrl: 'checkin-test.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ ]
})
export class CheckinTestPage extends BasePrivatePage {

  checkin:Checkin = null;

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

  ionViewWillEnter() {
    super.ionViewWillEnter();
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
      .then(() => { return this.loadCheckin(cache); })
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

  private loadCheckin(cache:boolean=true):Promise<Checkin> {
    return new Promise((resolve, reject) => {
      this.checkin = new Checkin({
        organization_id: this.organization.id,
        user_id: this.user.id,
        user_initials: this.user.initials,
        user_picture: this.user.profile_picture,
        message: "Did you receive this test Check-In?",
        self_test_check_in: true,
        send_via: 'app'
      });
      this.checkin.answers = [];
      this.checkin.answers.push(new Answer({
        icon: "icon-check",
        type: "positive",
        color: "#58AC5D",
        answer: "Yes"
      }));
      this.checkin.recipients = [];
      if (this.user) {
        let recipient = new Recipient(this.user);
        recipient.user_id = this.user.id;
        this.checkin.recipients.push(recipient);
      }
      resolve(this.checkin);
    });
  }

  private cancelCheckin(event:any) {
    this.hideModal();
  }

  private sendCheckin(event:any) {
    let loading = this.showLoading("Sending...", true);
    this.api.sendCheckin(this.organization, this.checkin).then((checkin:Checkin) => {
      this.storage.saveCheckin(this.organization, checkin).then((saved:boolean) => {
        loading.dismiss();
        this.showToast("Test Check-In sent");
        this.hideModal({
          checkin: checkin
        });
      },
      (error:any) => {
        loading.dismiss();
        this.showAlert("Problem Saving Checkin", error);
      });
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Creating Checkin", error);
    });
  }

}
