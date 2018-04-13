import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Events, Button, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { ReplySendPage } from '../../pages/reply-send/reply-send';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Checkin } from '../../models/checkin';
import { Person } from '../../models/person';
import { Reply } from '../../models/reply';

@IonicPage()
@Component({
  selector: 'page-reply-list',
  templateUrl: 'reply-list.html',
  providers: [ ApiService ],
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
      protected api:ApiService,
      protected database:DatabaseService,
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
        return this.database.getReplies(this.organization, this.checkin).then((replies:Reply[]) => {
          this.checkin.replies = replies;
          resolve(replies);
        });
      }
      else {
        return this.api.getCheckin(this.organization, this.checkin.id).then((checkin:Checkin) => {
          let saves = [];
          for (let answer of checkin.answers) {
            saves.push(this.database.saveAnswer(this.organization, checkin, answer));
          }
          for (let recipient of checkin.recipients) {
            saves.push(this.database.saveRecipient(this.organization, checkin, recipient));
          }
          for (let reply of checkin.replies) {
            saves.push(this.database.saveReply(this.organization, checkin, reply));
            if (this.person && this.person.id == reply.user_id) {
              checkin.replied = true;
            }
          }
          saves.push(this.database.saveCheckin(this.organization, checkin));
          Promise.all(saves).then(saved => {
            this.checkin = checkin;
            resolve(checkin.replies);
          });
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
      checkin: this.checkin });
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
        reply: reply });
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

}
