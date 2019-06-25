import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Slides, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Checkin } from '../../models/checkin';
import { Reply } from '../../models/reply';
import { Answer } from '../../models/answer';
import { Person } from '../../models/person';
import { Location } from '../../models/location';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'CheckinRespondPage',
  segment: 'checkins/respond',
  defaultHistory: ['CheckinListPage']
})
@Component({
  selector: 'page-checkin-respond',
  templateUrl: 'checkin-respond.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ ]
})
export class CheckinRespondPage extends BasePrivatePage {

  @ViewChild(Slides)
  slides:Slides;
  index:number = 0;
  loading:boolean = false;
  checkins:Checkin[] = [];
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
    this.loading = true;
    return Promise.resolve()
      .then(() => { return this.loadOrganization(cache); })
      .then(() => { return this.loadUser(cache); })
      .then(() => { return this.loadCheckins(cache); })
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

  private loadCheckins(cache:boolean=true):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.checkins = this.getParameter<Checkin[]>("checkins");
      this.checkin = this.getParameter<Checkin>("checkin");
      if (this.checkins && this.checkin) {
        this.index = this.checkins.indexOf(this.checkin);
        this.slides.lockSwipes(false);
      }
      else if (this.checkins && this.checkins.length > 0) {
        this.index = 0;
        this.checkin = this.checkins[0];
        this.slides.lockSwipes(false);
      }
      else {
        this.index = 0;
        this.checkins = [this.checkin];
        this.checkin.reply = this.getParameter<Reply>("reply");
        this.slides.lockSwipes(true);
      }
      for (let checkin of this.checkins) {
        if (checkin.reply == null) {
          checkin.reply = new Reply();
          checkin.reply.organization_id = this.organization.id;
          checkin.reply.checkin_id = this.checkin.id;
        }
      }
      resolve(true);
    });
  }

  private slideChanged(event:any) {
    let index = this.slides.getActiveIndex();
    if (index >= 0 && index < this.checkins.length) {
      this.logger.info(this, "slideChanged", event, index);
      this.index = index;
      this.checkin = this.checkins[this.index];
    }
    else {
      this.logger.warn(this, "slideChanged", event, index);
    }
  }

  private cancelReply(event:any) {
    this.logger.info(this, "cancelReply");
    if (this.checkin && this.checkin.reply && this.checkin.reply.id) {
      this.storage.getReply(this.organization, this.checkin.reply.id).then((reply:Reply) => {
        this.checkin.reply.answer = reply.answer;
        this.checkin.reply.message = reply.message;
        this.checkin.reply.location_text = reply.location_text;
        this.hideModal({
          canceled: true
        });
      },
      (error:any) => {
        this.hideModal({
          canceled: true
        });
      });
    }
    else {
      this.hideModal({
        canceled: true
      });
    }
  }

  private sendReply(checkin:Checkin, reply:Reply) {
    this.logger.info(this, "sendReply", reply);
    if (reply.answer == null || reply.answer.length == 0) {
      this.showToast("Answer is required, please select your response");
    }
    else {
      let loading = this.showLoading("Sending...", true);
      this.api.sendReply(this.organization, checkin, reply).then((replied:Reply) => {
        this.logger.info(this, "sendReply", "Reply", replied);
        if (this.mobile) {
          this.storage.getPerson(this.organization, replied.user_id).then((person:Person) => {
            this.logger.info(this, "sendReply", "Person", person);
            replied.user_name = person.name;
            replied.user_description = person.description;
            replied.user_initials = person.initials;
            replied.user_picture = person.profile_picture;
            this.storage.saveReply(this.organization, checkin, replied).then(saved => {
              loading.dismiss();
              this.hideCheckin(checkin, replied);
            });
          });
        }
        else {
          loading.dismiss();
          this.hideCheckin(checkin, replied);
        }
      },
      (error:any) => {
        loading.dismiss();
        this.showAlert("Problem Sending Reply", error);
      });
    }
  }

  private saveReply(checkin:Checkin, reply:Reply) {
    this.logger.info(this, "saveReply", reply);
    if (reply.answer == null || reply.answer.length == 0) {
      this.showToast("Answer is required, please select your response");
    }
    else {
      let loading = this.showLoading("Sending...", true);
      this.api.updateReply(this.organization, checkin, reply).then((replied:Reply) => {
        this.logger.info(this, "saveReply", "Reply", replied);
        if (this.mobile) {
          this.storage.getPerson(this.organization, replied.user_id).then((person:Person) => {
            this.logger.info(this, "saveReply", "Person", person);
            replied.user_name = person.name;
            replied.user_description = person.description;
            replied.user_initials = person.initials;
            replied.user_picture = person.profile_picture;
            this.storage.saveReply(this.organization, checkin, replied).then(saved => {
              loading.dismiss();
              this.hideCheckin(checkin, replied);
            });
          });
        }
        else {
          loading.dismiss();
          this.hideCheckin(checkin, replied);
        }
      },
      (error:any) => {
        loading.dismiss();
        this.showAlert("Problem Saving Reply", error);
      });
    }
  }

  private hideCheckin(checkin:Checkin, reply:Reply) {
    if (this.checkins.length > 1) {
      let index = this.slides.getActiveIndex();
      this.logger.info(this, "hideCheckin", index);
      if (index == 0) {
        this.checkins.shift();
        this.slides.slideTo(0, 0, true);
      }
      else {
        this.checkins.splice(index, 1);
        this.slides.slideTo(index-1, 0, true);
      }
    }
    else {
      this.showToast("Your reply has been sent");
      this.hideModal({reply: reply});
    }
  }

}
