import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Button, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';
import { CheckinRespondPage } from '../../pages/checkin-respond/checkin-respond';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Checkin } from '../../models/checkin';
import { Person } from '../../models/person';
import { Reply } from '../../models/reply';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

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
  modal:boolean = false;
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

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.modal = this.getParameter<boolean>("modal");
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
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    this.loading = true;
    return Promise.resolve()
      .then(() => { return this.loadOrganization(cache); })
      .then(() => { return this.loadUser(cache); })
      .then(() => { return this.loadCheckin(cache); })
      .then(() => { return this.loadReplies(cache); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Loaded");
        if (event) {
          event.complete();
        }
        this.loading = false;
      })
      .catch((error) => {
        this.logger.info(this, "loadUpdates", "Failed", error);
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
      else if (this.hasParameter("checkin_id")){
        let checkinId = this.getParameter<number>("checkin_id");
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
          this.storage.saveReplies(this.organization,  this.checkin, replies).then((saved:boolean) => {
            this.checkin.replies = replies;
            resolve(replies);
          });
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

  private editReply(reply:Reply, event:any) {
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

  private shareCheckin(event:any) {
    let subject = this.checkin.message;
    let message = [];
    for (let answer of this.checkin.answers) {
      if (answer.replies > 0) {
        let replies = [];
        for (let reply of this.checkin.answerReplies(answer)) {
          replies.push(reply.user_name);
        }
        message.push(`${answer.answer} - ${replies.join(", ")}`);
      }
    }
    if (this.checkin.replies.length < this.checkin.recipients.length) {
      let pending = [];
      for (let recipient of this.checkin.recipientsPending()) {
        pending.push(recipient.name);
      }
      message.push(`No Response - ${pending.join(", ")}`);
    }
    let image = this.checkin.user_picture;
    let website = `https://${this.organization.subdomain}.tenfour.org/checkins/${this.checkin.id}`;
    this.logger.info(this, "shareCheckin", subject, message.join(" "), image, website);
    this.showShare(subject, message.join(" "), image, website);
  }

}
