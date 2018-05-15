import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Slides, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiProvider } from '../../providers/api/api';
import { DatabaseProvider } from '../../providers/database/database';
import { LocationProvider } from '../../providers/location/location';

import { Organization } from '../../models/organization';
import { Checkin } from '../../models/checkin';
import { Reply } from '../../models/reply';
import { Answer } from '../../models/answer';
import { Person } from '../../models/person';
import { Location } from '../../models/location';

@IonicPage({
  segment: 'checkins/send',
  defaultHistory: ['checkins']
})
@Component({
  selector: 'page-checkin-respond',
  templateUrl: 'checkin-respond.html',
  providers: [ ApiProvider ],
  entryComponents:[  ]
})
export class CheckinRespondPage extends BasePage {

  @ViewChild(Slides)
  slides:Slides;
  index:number = 0;
  loading:boolean = false;

  organization:Organization = null;
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
    protected database:DatabaseProvider,
    protected location:LocationProvider) {
    super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.checkins = this.getParameter<Checkin[]>("checkins");
    this.checkin = this.getParameter<Checkin>("checkin");
    if (this.checkins && this.checkin) {
      this.index = this.checkins.indexOf(this.checkin);
    }
    else if (this.checkins) {
      this.index = 0;
      this.checkin = this.checkins[0];
    }
    else {
      this.index = 0;
      this.checkins = [this.checkin];
      this.checkin.reply = this.getParameter<Reply>("reply");
    }
    for (let checkin of this.checkins) {
      if (checkin.reply == null) {
        checkin.reply = new Reply();
        checkin.reply.organization_id = this.organization.id;
        checkin.reply.checkin_id = this.checkin.id;
      }
    }
    this.loadLocation().then((location:Location) => {
      this.logger.info(this, "Location", location);
      if (location) {
        for (let checkin of this.checkins) {
          if (checkin.reply.location_text == null) {
            checkin.reply.latitude = location.latitude;
            checkin.reply.longitude = location.longitude;
            checkin.reply.location_text = location.address;
          }
        }
      }
    },
    (error:any) => {
      this.logger.error(this, "Location", error);
    });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    if (this.organization) {
      this.trackPage({
        organization: this.organization.name
      });  
    }
  }

  private loadLocation():Promise<Location> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadLocation");
      this.location.detectLocation().then((location:Location) => {
        this.logger.info(this, "loadLocation", location);
        this.location.lookupAddress(location).then((address:string) => {
          this.logger.info(this, "loadLocation", address);
          location.address = address;
          resolve(location);
        },
        (error:any) => {
          this.logger.error(this, "loadLocation", error);
          resolve(location);
        });
      },
      (error:any) => {
        this.logger.error(this, "loadLocation", error);
        reject(error);
      });
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
      this.logger.error(this, "slideChanged", event, index);
    }
  }

  private selectAnswer(checkin:Checkin, reply:Reply, answer:Answer) {
    this.logger.info(this, "selectAnswer", answer);
    reply.answer = answer.answer;
  }

  private cancelReply(event:any) {
    this.logger.info(this, "cancelReply");
    if (this.checkin && this.checkin.reply && this.checkin.reply.id) {
      this.database.getReply(this.organization, this.checkin.reply.id).then((reply:Reply) => {
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
      let loading = this.showLoading("Sending...");
      this.api.sendReply(this.organization, checkin, reply).then((replied:Reply) => {
        this.logger.info(this, "sendReply", "Reply", replied);
        if (this.mobile) {
          this.database.getPerson(this.organization, replied.user_id).then((person:Person) => {
            this.logger.info(this, "sendReply", "Person", person);
            replied.user_name = person.name;
            replied.user_description = person.description;
            replied.user_initials = person.initials;
            replied.user_picture = person.profile_picture;
            this.database.saveReply(this.organization, checkin, replied).then(saved => {
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
      let loading = this.showLoading("Sending...");
      this.api.updateReply(this.organization, checkin, reply).then((replied:Reply) => {
        this.logger.info(this, "saveReply", "Reply", replied);
        if (this.mobile) {
          this.database.getPerson(this.organization, replied.user_id).then((person:Person) => {
            this.logger.info(this, "saveReply", "Person", person);
            replied.user_name = person.name;
            replied.user_description = person.description;
            replied.user_initials = person.initials;
            replied.user_picture = person.profile_picture;
            this.database.saveReply(this.organization, checkin, replied).then(saved => {
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

  private removeMessage(reply:Reply) {
    this.logger.info(this, "removeMessage", reply);
    reply.message = null;
  }

  private removeLocation(reply:Reply) {
    this.logger.info(this, "removeLocation", reply);
    reply.location_text = null;
    reply.latitude = null;
    reply.longitude = null;
  }

  private onKeyPress(event:any) {
    if (event.keyCode == 13) {
      this.logger.info(this, "onKeyPress", "Enter");
      this.hideKeyboard();
      return false;
    }
    else {
      return true;
    }
  }

}
