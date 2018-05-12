import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Events, Button, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { ReplySendPage } from '../../pages/reply-send/reply-send';

import { ApiProvider } from '../../providers/api/api';
import { DatabaseProvider } from '../../providers/database/database';

import { Organization } from '../../models/organization';
import { Checkin } from '../../models/checkin';
import { Person } from '../../models/person';
import { Reply } from '../../models/reply';

@IonicPage()
@Component({
  selector: 'page-reply-list',
  templateUrl: 'reply-list.html',
  providers: [ ApiProvider ],
  entryComponents:[ ReplySendPage ]
})
export class ReplyListPage extends BasePage {

  @ViewChild('notifications')
  notifications:Button;

  @ViewChild('create')
  create:Button;

  organization:Organization = null;

  checkin:Checkin = null;

  person:Person = null;

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
      protected database:DatabaseProvider,
      protected events:Events) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.checkin = this.getParameter<Checkin>("checkin");
    this.person = this.getParameter<Person>("person");
    this.loadUpdates(true);
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.trackPage({
      organization: this.organization.name,
      checkin: this.checkin.message
    });
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.loading = true;
    Promise.all([this.loadReplies(cache)]).then(
      (loaded:any) =>{
        if (event) {
          event.complete();
        }
        this.loading = false;
      },
      (error:any) => {
        if (event) {
          event.complete();
        }
        this.loading = false;
        this.showToast(error);
      });
  }

  private loadReplies(cache:boolean=true):Promise<any> {
    return new Promise((resolve, reject) => {
      if (cache) {
        this.database.getReplies(this.organization, this.checkin).then((replies:Reply[]) => {
          this.checkin.replies = replies;
          resolve(replies);
        },
        (error:any) => {
          this.loadReplies(false).then((replies:Reply[]) => {
            this.checkin.replies = replies;
            resolve(replies);
          },
          (error:any) => {
            reject(error);
          });
        });
      }
      else {
        this.api.getCheckin(this.organization, this.checkin.id).then((checkin:Checkin) => {
          for (let reply of checkin.replies) {
            if (this.person && this.person.id == reply.user_id) {
              checkin.replied = true;
            }
          }
          if (this.mobile) {
            this.database.saveCheckin(this.organization, checkin).then((saved:boolean) => {
              this.checkin = checkin;
              resolve(checkin.replies);
            });
          }
          else {
            this.checkin = checkin;
            resolve(checkin.replies);
          }
        },
        (error:any) => {
          reject(error);
        });
      }
    });
  }

  private sendReply(event:any) {
    this.logger.info(this, "sendReply");
    let modal = this.showModal(ReplySendPage, {
      organization: this.organization,
      checkin: this.checkin
    });
    modal.onDidDismiss(data => {
      this.logger.info(this, "sendReply", "Modal", data);
      if (data) {
        if (data.canceled) {
          this.logger.info(this, "sendReply", "Modal", "Canceled");
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
    if (reply.user_id == this.person.id) {
      let modal = this.showModal(ReplySendPage, {
        organization: this.organization,
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
    let loading = this.showLoading("Resending...");
    this.api.resendCheckin(this.organization, this.checkin).then((checkin:Checkin) => {
      loading.dismiss();
      this.showToast(`Check-In ${this.checkin.message} resent`);
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Resending Check-In", error);
    });
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
