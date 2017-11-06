import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Slides, Button, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Rollcall } from '../../models/rollcall';
import { Reply } from '../../models/reply';
import { Answer } from '../../models/answer';
import { Person } from '../../models/person';

@IonicPage()
@Component({
  selector: 'page-reply-send',
  templateUrl: 'reply-send.html',
  providers: [ ApiService ],
  entryComponents:[  ]
})
export class ReplySendPage extends BasePage {

  @ViewChild(Slides)
  slides:Slides;
  index:number = 0;
  loading:boolean = false;

  organization:Organization = null;
  rollcalls:Rollcall[] = [];
  rollcall:Rollcall = null;

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
      protected database:DatabaseService) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.rollcalls = this.getParameter<Rollcall[]>("rollcalls");
    this.rollcall = this.getParameter<Rollcall>("rollcall");
    if (this.rollcalls && this.rollcall) {
      this.index = this.rollcalls.indexOf(this.rollcall);
    }
    else if (this.rollcalls) {
      this.index = 0;
      this.rollcall = this.rollcalls[0];
    }
    else {
      this.index = 0;
      this.rollcalls = [this.rollcall];
      this.rollcall.reply = this.getParameter<Reply>("reply");
    }
    for (let rollcall of this.rollcalls) {
      if (rollcall.reply == null) {
        rollcall.reply = new Reply();
        rollcall.reply.organization_id = this.organization.id;
        rollcall.reply.rollcall_id = this.rollcall.id;
      }
    }
  }

  slideChanged(event:any) {
    let index = this.slides.getActiveIndex();
    if (index >= 0 && index < this.rollcalls.length) {
      this.logger.info(this, "slideChanged", event, index);
      this.index = index;
      this.rollcall = this.rollcalls[this.index];
    }
    else {
      this.logger.error(this, "slideChanged", event, index);
    }
  }

  selectAnswer(rollcall:Rollcall, reply:Reply, answer:Answer) {
    this.logger.info(this, "selectAnswer", answer);
    reply.answer = answer.answer;
  }

  cancelReply(event:any) {
    this.logger.info(this, "cancelReply");
    this.hideModal();
  }

  sendReply(rollcall:Rollcall, reply:Reply) {
    this.logger.info(this, "sendReply", reply);
    if (reply.answer == null || reply.answer.length == 0) {
      this.showToast("Answer is required, please select your response");
    }
    else {
      let loading = this.showLoading("Sending...");
      this.api.postReply(this.organization, rollcall, reply).then(
        (replied:Reply) => {
          this.logger.info(this, "sendReply", "Reply", replied);
          this.database.getPerson(replied.user_id).then((person:Person) => {
            this.logger.info(this, "sendReply", "Person", person);
            replied.user_name = person.name;
            replied.user_description = person.description;
            replied.user_initials = person.initials;
            replied.user_picture = person.profile_picture;
            this.database.saveReply(rollcall, replied).then(saved => {
              loading.dismiss();
              this.hideRollcall(rollcall, replied);
            });
          });
        },
        (error:any) => {
          loading.dismiss();
          this.showAlert("Problem Sending Reply", error);
        });
    }
  }

  saveReply(rollcall:Rollcall, reply:Reply) {
    this.logger.info(this, "saveReply", reply);
    let loading = this.showLoading("Sending...");
    this.api.putReply(this.organization, rollcall, reply).then(
      (replied:Reply) => {
        this.logger.info(this, "saveReply", "Reply", replied);
        this.database.getPerson(replied.user_id).then((person:Person) => {
          this.logger.info(this, "saveReply", "Person", person);
          replied.user_name = person.name;
          replied.user_description = person.description;
          replied.user_initials = person.initials;
          replied.user_picture = person.profile_picture;
          this.database.saveReply(rollcall, replied).then(saved => {
            loading.dismiss();
            this.hideRollcall(rollcall, replied);
          });
        });
      },
      (error:any) => {
        loading.dismiss();
        this.showAlert("Problem Saving Reply", error);
      });
  }

  hideRollcall(rollcall:Rollcall, reply:Reply) {
    if (this.rollcalls.length > 1) {
      let index = this.slides.getActiveIndex();
      this.logger.info(this, "hideRollcall", index);
      if (index == 0) {
        this.rollcalls.shift();
        this.slides.slideTo(0, 0, true);
      }
      else {
        this.rollcalls.splice(index, 1);
        this.slides.slideTo(index-1, 0, true);
      }
    }
    else {
      this.showToast("Rollcall Reply Sent");
      this.hideModal({reply: reply});
    }
  }

}
