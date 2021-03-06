import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Button, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController, PopoverController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';
import { CheckinRespondPage } from '../../pages/checkin-respond/checkin-respond';
import { CheckinActionsComponent } from '../../components/checkin-actions/checkin-actions';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Checkin } from '../../models/checkin';
import { Person } from '../../models/person';
import { Reply } from '../../models/reply';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

import { EVENT_CHECKIN_UPDATED } from '../../constants/events';

@IonicPage({
  name: 'CheckinDetailsPage',
  segment: 'checkins/:checkin_id',
  defaultHistory: ['CheckinListPage']
})
@Component({
  selector: 'page-checkin-details',
  templateUrl: 'checkin-details.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ CheckinRespondPage ]
})
export class CheckinDetailsPage extends BasePrivatePage {

  @ViewChild('notifications')
  notifications:Button;

  @ViewChild('create')
  create:Button;

  checkin:Checkin = null;
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
      protected popoverController:PopoverController,
      protected api:ApiProvider,
      protected storage:StorageProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    let loading = this.showLoading("Loading...");
    this.loadUpdates(true).then((loaded:any) => {
      loading.dismiss();
    });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    if (this.organization && this.checkin) {
      this.analytics.trackPage(this, {
        organization: this.organization.name,
        checkin: this.checkin.message
      });
    }
    this.events.subscribe(EVENT_CHECKIN_UPDATED, (checkinId:number, data:any) => {
      this.logger.info(this, EVENT_CHECKIN_UPDATED, checkinId);
      if (this.checkin.id === checkinId) {
        let alert = this.showAlert("Check-In Received", "This Check-In has received a new response.");
        alert.onDidDismiss(data => {
          let loading = this.showLoading("Loading...");
          Promise.resolve()
            .then(() => { return this.loadCheckin(false); })
            .then(() => { return this.loadReplies(false); })
            .then(() => {
              loading.dismiss();
              this.logger.info(this, "loadUpdates", "Loaded");
            })
            .catch((error) => {
              loading.dismiss();
              this.logger.error(this, "loadUpdates", "Failed", error);
            });
        });
      }
    });
  }

  ionViewWillLeave() {
    super.ionViewWillLeave();
    this.events.unsubscribe(EVENT_CHECKIN_UPDATED);
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    this.loading = true;
    return Promise.resolve()
      .then(() => { return this.loadOrganization(cache); })
      .then(() => { return this.loadUser(cache); })
      .then(() => { return this.loadCheckin(cache); })
      .then(() => { return this.loadReplies(false); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Loaded");
        if (event) {
          event.complete();
        }
        this.loading = false;
      })
      .catch((error) => {
        this.logger.error(this, "loadUpdates", "Failed", error);
        if (event) {
          event.complete();
        }
        this.loading = false;
        this.showToast(error);
      });
  }

  private loadCheckin(cache:boolean=true):Promise<Checkin> {
    return new Promise((resolve, reject) => {
      if (cache && this.checkin) {
        resolve(this.checkin);
      }
      else if (cache && this.hasParameter("checkin")){
        this.checkin = this.getParameter<Checkin>("checkin");
        resolve(this.checkin);
      }
      else if (this.hasParameter("checkin_id") || this.checkin) {
        let checkinId = this.getParameter<number>("checkin_id") || this.checkin.id;
        this.promiseFallback(cache,
          this.storage.getCheckin(this.organization, checkinId),
          this.api.getCheckin(this.organization, checkinId)).then((checkin:Checkin) => {
            for (let reply of checkin.replies) {
              if (this.user && this.user.id == reply.user_id) {
                checkin.replied = true;
              }
            }
            this.storage.saveCheckin(this.organization, checkin).then((saved:boolean) => {
              this.checkin = checkin;
              resolve(checkin);
            });
          },
          (error:any) => {
            reject(error);
          });
      }
      else {
        reject("Checkin Not Provided");
      }
    });
  }

  private loadReplies(cache:boolean=true):Promise<any> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadReplies");
      this.promiseFallback(cache,
        this.storage.getReplies(this.organization, this.checkin),
        this.api.getReplies(this.organization, this.checkin)).then((replies:Reply[]) => {
          this.logger.info(this, "loadReplies", replies);
          this.storage.saveReplies(this.organization, this.checkin, replies).then((saved:boolean) => {
            this.checkin.replies = replies;
            resolve(replies);
          },
          (error:any) => {
            this.logger.error(this, "loadReplies", error);
            resolve(replies);
          });
        },
        (error:any) => {
          reject(error);
        });
    });
  }

  private respondCheckin(event:any) {
    this.logger.info(this, "respondCheckin");
    let modal = this.showModal(CheckinRespondPage, {
      organization: this.organization,
      checkins: [this.checkin],
      checkin: this.checkin
    });
    modal.onDidDismiss(data => {
      this.logger.info(this, "respondCheckin", "Modal", data);
      if (data) {
        if (data.canceled) {
          this.logger.info(this, "respondCheckin", "Modal", "Canceled");
        }
        else {
          let loading = this.showLoading("Refreshing...");
          this.loadReplies(false).then((replies) => {
            loading.dismiss();
          });
        }
      }
   });
  }

  private editReply(reply:Reply) {
    this.logger.info(this, "editReply");
    if (reply.user_id == this.user.id) {
      let modal = this.showModal(CheckinRespondPage, {
        organization: this.organization,
        checkins: [this.checkin],
        checkin: this.checkin,
        reply: reply
      });
      modal.onDidDismiss(data => {
        this.logger.info(this, "editReply", "Modal", data);
        if (data) {
          if (data.canceled) {
            this.logger.info(this, "editReply", "Modal", "Canceled");
          }
          else {
            let loading = this.showLoading("Refreshing...");
            this.loadReplies(false).then((replies) => {
              loading.dismiss();
            });
          }
        }
     });
    }
  }

  private resendCheckin(event:any) {
    this.logger.info(this, "resendCheckin");
    let loading = this.showLoading("Resending...", true);
    this.api.resendCheckin(this.organization, this.checkin).then((checkin:Checkin) => {
      loading.dismiss();
      this.showToast(`Check-In ${this.checkin.message} resent`);
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Resending Check-In", error);
    });
  }

  private closeModal(event:any) {
    this.hideModal();
  }

  private showCheckinActions($event) {
    this.logger.info(this, "showCheckinActions");

    let popover = this.popoverController.create(CheckinActionsComponent, {
      organization: this.organization,
      user: this.user,
      checkin: this.checkin
    });
    popover.onDidDismiss(data => {
      this.logger.info(this, 'showCheckinActions', 'onDidDismiss');

      if (data) {
        this.loadUpdates(false);
      }
    });
    popover.present({
      ev: $event
    });
  }

}
