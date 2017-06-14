import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Events, Button, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { ReplySendPage } from '../../pages/reply-send/reply-send';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Rollcall } from '../../models/rollcall';
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

  rollcall:Rollcall = null;

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
    this.rollcall = this.getParameter<Rollcall>("rollcall");
    this.person = this.getParameter<Person>("person");
    this.loadUpdates(null, true);
  }

  loadUpdates(event:any, cache:boolean=true) {
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

  loadReplies(cache:boolean=true):Promise<any> {
    return new Promise((resolve, reject) => {
      if (cache) {
        return this.database.getReplies(this.rollcall).then((replies:Reply[]) => {
          this.rollcall.replies = replies;
          resolve(replies);
        });
      }
      else {
        return this.api.getRollcall(this.rollcall.id).then((rollcall:Rollcall) => {
          let saves = [];
          for (let answer of rollcall.answers) {
            saves.push(this.database.saveAnswer(rollcall, answer));
          }
          for (let recipient of rollcall.recipients) {
            saves.push(this.database.saveRecipient(rollcall, recipient));
          }
          for (let reply of rollcall.replies) {
            saves.push(this.database.saveReply(rollcall, reply));
            if (this.person && this.person.id == reply.user_id) {
              rollcall.replied = true;
            }
          }
          saves.push(this.database.saveRollcall(this.organization, rollcall));
          Promise.all(saves).then(saved => {
            this.rollcall = rollcall;
            resolve(rollcall.replies);
          });
        },
        (error:any) => {
          reject(error);
        });
      }
    });
  }

  sendReply(event:any) {
    this.logger.info(this, "sendReply");
    let modal = this.showModal(ReplySendPage, {
      organization: this.organization,
      rollcall: this.rollcall });
    modal.onDidDismiss(data => {
      if (data) {
        let loading = this.showLoading("Refreshing...");
        this.loadReplies(false).then((replies) => {
          loading.dismiss();
        });
      }
   });
  }

  editReply(event:any, reply:Reply) {
    this.logger.info(this, "editReply");
    if (reply.user_id == this.person.id) {
      let modal = this.showModal(ReplySendPage, {
        organization: this.organization,
        rollcall: this.rollcall,
        reply: reply });
      modal.onDidDismiss(data => {
        if (data) {
          let loading = this.showLoading("Refreshing...");
          this.loadReplies(false).then((replies) => {
            loading.dismiss();
          });
        }
     });
    }
  }

}
