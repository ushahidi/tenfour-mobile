import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Events, Button, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Rollcall } from '../../models/rollcall';
import { Reply } from '../../models/reply';
import { Answer } from '../../models/answer';
import { Recipient } from '../../models/recipient';
import { Person } from '../../models/person';

@IonicPage()
@Component({
  selector: 'page-reply-send',
  templateUrl: 'reply-send.html',
  providers: [ ApiService ],
  entryComponents:[  ]
})
export class ReplySendPage extends BasePage {

  @ViewChild('notifications')
  notifications:Button;

  @ViewChild('create')
  create:Button;

  organization:Organization = null;

  rollcall:Rollcall = null;

  reply:Reply = null;

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
    this.reply = this.getParameter<Reply>("reply");
    if (this.reply == null) {
      this.reply = new Reply();
      this.reply.organization_id = this.organization.id;
      this.reply.rollcall_id = this.rollcall.id;
    }
  }

  selectAnswer(event:any, answer:Answer) {
    if (answer) {
      this.reply.answer = answer.answer;
    }
  }

  cancelReply(event:any) {
    this.logger.info(this, "cancelReply");
    this.hideModal();
  }

  sendReply(event:any) {
    this.logger.info(this, "sendReply");
    let loading = this.showLoading("Sending...");
    this.api.postReply(this.rollcall, this.reply).then(
      (replied:Reply) => {
        this.logger.info(this, "sendReply", "Reply", replied);
        this.database.getPerson(replied.user_id).then((person:Person) => {
          this.logger.info(this, "sendReply", "Person", person);
          replied.user_name = person.name;
          replied.user_description = person.description;
          replied.user_initials = person.initials;
          replied.user_picture = person.profile_picture;
          this.database.saveReply(this.rollcall, replied).then(saved => {
            loading.dismiss();
            this.showToast("Rollcall Reply Sent");
            this.hideModal({reply: replied});
          });
        });
      },
      (error:any) => {
        loading.dismiss();
        this.showAlert("Problem Sending Reply", error);
      });
  }

}
