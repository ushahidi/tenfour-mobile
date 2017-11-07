import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Slides, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { Geolocation } from '@ionic-native/geolocation';
import { NativeGeocoder, NativeGeocoderReverseResult } from '@ionic-native/native-geocoder';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Rollcall } from '../../models/rollcall';
import { Reply } from '../../models/reply';
import { Answer } from '../../models/answer';
import { Person } from '../../models/person';
import { Location } from '../../models/location';

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
    protected database:DatabaseService,
    protected geolocation:Geolocation,
    protected geocoder:NativeGeocoder) {
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
    this.loadLocation().then((location:Location) => {
      this.logger.info(this, "Location", location);
      if (location) {
        for (let rollcall of this.rollcalls) {
          if (rollcall.reply.location_text == null) {
            rollcall.reply.latitude = location.latitude;
            rollcall.reply.longitude = location.longitude;
            rollcall.reply.location_text = location.address;
          }
        }
      }
    },
    (error:any) => {
      this.logger.error(this, "Location", error);
    });
  }

  loadLocation():Promise<Location> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadLocation");
      this.geolocation.getCurrentPosition().then((position:any) => {
        this.logger.info(this, "loadLocation", position);
        if (position && position.coords) {
          let location = <Location>{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          this.loadAddress(position.coords.latitude, position.coords.longitude).then((address:string) => {
            location.address = address;
            resolve(location);
          },
          (error:any) => {
            resolve(location);
          });
        }
        else {
          reject(null);
        }
      }).catch((error:any) => {
        this.logger.error(this, "loadLocation", error);
        reject(null);
      });
    });
  }

  loadAddress(latitude:number, longitude:number):Promise<string> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadAddress", latitude, longitude);
      this.geocoder.reverseGeocode(latitude, longitude)
        .then((result:NativeGeocoderReverseResult) => {
          this.logger.info(this, "loadAddress", latitude, longitude, result);
          let location:any[] = [];
          if (result.thoroughfare) {
            location.push(result.thoroughfare);
          }
          if (result.locality) {
            location.push(result.locality);
          }
          if (result.administrativeArea) {
            location.push(result.administrativeArea);
          }
          if (result.countryName) {
            location.push(result.countryName);
          }
          resolve(location.join(", "));
        })
        .catch((error:any) => {
          this.logger.error(this, "loadAddress", latitude, longitude, error);
          reject(error);
        });
    });
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
    if (reply.answer == null || reply.answer.length == 0) {
      this.showToast("Answer is required, please select your response");
    }
    else {
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

  removeMessage(reply:Reply) {
    this.logger.info(this, "removeMessage", reply);
    reply.message = null;
  }

  removeLocation(reply:Reply) {
    this.logger.info(this, "removeLocation", reply);
    reply.location_text = null;
    reply.latitude = null;
    reply.longitude = null;
  }

}
