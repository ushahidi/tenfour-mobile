import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Events, Button, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { RollcallReplyPage } from '../../pages/rollcall-reply/rollcall-reply';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Rollcall } from '../../models/rollcall';
import { Reply } from '../../models/reply';
import { Recipient } from '../../models/recipient';
import { Token } from '../../models/token';

@IonicPage()
@Component({
  selector: 'page-rollcall-replies',
  templateUrl: 'rollcall-replies.html',
  providers: [ ApiService ],
  entryComponents:[ RollcallReplyPage ]
})
export class RollcallRepliesPage extends BasePage {

  @ViewChild('notifications')
  notifications:Button;

  @ViewChild('create')
  create:Button;

  organization:Organization = null;

  rollcall:Rollcall = null;

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
    this.loadReplies(null, true);
  }

  loadReplies(event:any, cache:boolean=true) {
    if (cache) {
      return this.database.getReplies(this.rollcall).then((replies:Reply[]) => {
        this.rollcall.replies = replies;
        if (event) {
          event.complete();
        }
      });
    }
    else {
      this.api.getToken().then((token:Token) => {
        this.api.getRollcall(token, this.rollcall.id).then((rollcall:Rollcall) => {
          let saves = [];
          saves.push(this.database.saveRollcall(this.organization, rollcall));
          for (let answer of rollcall.answers) {
            saves.push(this.database.saveAnswer(rollcall, answer));
          }
          for (let recipient of rollcall.recipients) {
            saves.push(this.database.saveRecipient(rollcall, recipient));
          }
          for (let reply of rollcall.replies) {
            saves.push(this.database.saveReply(rollcall, reply));
          }
          Promise.all(saves).then(saved => {
            if (event) {
              event.complete();
            }
            this.loading = false;
          });
        },
        (error:any) => {
          if (event) {
            event.complete();
          }
          this.loading = false;
          this.showToast(error);
        });
      });
    }
  }

  sendReply(event) {
    this.logger.info(this, "sendReply");
    let modal = this.showModal(RollcallReplyPage, {
      organization: this.organization,
      rollcall: this.rollcall });
    modal.onDidDismiss(data => {
      if (data) {
        this.loadReplies(null, true);  
      }
   });
  }

}
