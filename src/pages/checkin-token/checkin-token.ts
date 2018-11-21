import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Slides, Platform, NavParams, NavController, ViewController, ModalController, Modal, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { SigninUrlPage } from '../../pages/signin-url/signin-url';
import { CheckinListPage } from '../../pages/checkin-list/checkin-list';

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
  name: 'CheckinTokenPage',
  segment: 'r/:checkin_id/:answer_id/:user_id/:token'
})
@Component({
  selector: 'page-checkin-token',
  templateUrl: 'checkin-token.html',
  providers:[ StorageProvider, ApiProvider ]
})
export class CheckinTokenPage extends BasePage {

  organization:Organization = null;
  user:User = null;
  checkin:Checkin = null;
  token:string = null;
  answer:string = null;
  loading:boolean = false;
  inModal:boolean = false;

  tokenModal:Modal;

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
    super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();

    if (!this.navParams.get('inModal')) {
      this.loading=true;
      this.tokenModal = this.showModal(CheckinTokenPage, {
        inModal: true,
        token: this.getParameter('token'),
        answer_id: this.getParameter('answer_id'),
        checkin_id: this.getParameter('checkin_id')
      }, {enableBackdropDismiss: false});
    }

    let loading = this.showLoading("Loading...");
    this.inModal = this.navParams.get('inModal');
    this.loadUpdates(false).then((finished:any) => {
      this.logger.info(this, "ionViewDidLoad", "loadUpdates", "Loaded");
      loading.dismiss();
    });
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    this.loading = true;
    return Promise.resolve()
      .then(() => { return this.loadToken(cache); })
      .then(() => { return this.loadCheckin(cache); })
      .then(() => { return this.loadAnswer(cache); })
      .then(() => { return this.loadOrganization(cache); })
      .then(() => { return this.loadUser(cache); })
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
        let alert = this.showAlert("Problem Loading Check-In", error);
        alert.onDidDismiss(data => {
          this.showNextPage();
        });
      });
  }

  protected loadOrganization(cache:boolean=true):Promise<Organization> {
    return new Promise((resolve, reject) => {
      if (cache && this.organization) {
        resolve(this.organization);
      }
      else {
        this.storage.getOrganization().then((organization:Organization) => {
          this.organization = organization;
          resolve(this.organization);
        },
        (error:any) => {
          this.organization = null;
          resolve(null);
        });
      }
    });
  }

  protected loadUser(cache:boolean=true):Promise<User> {
    return new Promise((resolve, reject) => {
      if (cache && this.user) {
        resolve(this.user);
      }
      else {
        this.storage.getUser().then((user:User) => {
          this.user = user;
          resolve(this.user);
        },
        (error:any) => {
          this.user = null;
          resolve(null);
        });
      }
    });
  }

  private loadToken(cache:boolean=true):Promise<string> {
    return new Promise((resolve, reject) => {
      if (cache && this.token) {
        this.logger.info(this, "loadToken", this.token);
        resolve(this.token);
      }
      else if (this.hasParameter("token")){
        this.token = this.getParameter<string>("token");
        this.logger.info(this, "loadToken", this.token);
        resolve(this.token);
      }
      else {
        this.token = null;
        reject("There was a problem loading the token for the Check-In.");
      }
    })
  }

  private loadAnswer(cache:boolean=true):Promise<string> {
    return new Promise((resolve, reject) => {
      if (cache && this.answer) {
        this.logger.info(this, "loadAnswer", this.answer);
        resolve(this.answer);
      }
      else if (this.hasParameter("answer_id")){
        let answerId = this.getParameter<number>("answer_id");
        if (this.checkin.answers.length > answerId) {
          let answer = this.checkin.answers[answerId];
          this.answer = answer.answer;
          this.checkin.reply.answer = answer.answer;
          this.logger.info(this, "loadAnswer", answerId, answer.answer);
        }
        else {
          this.logger.warn(this, "loadAnswer", answerId);
        }
        resolve(this.answer);
      }
      else {
        this.answer = null;
        resolve(null);
      }
    })
  }

  private loadCheckin(cache:boolean=true):Promise<Checkin> {
    return new Promise((resolve, reject) => {
      if (cache && this.checkin) {
        this.logger.info(this, "loadCheckin", this.checkin);
        resolve(this.checkin);
      }
      else if (this.hasParameter("checkin_id")){
        let checkinId = this.getParameter<number>("checkin_id");
        this.logger.info(this, "loadCheckin", checkinId);
        this.api.getCheckinForToken(checkinId, this.token).then((checkin:Checkin) => {
          this.logger.info(this, "loadCheckin", checkinId, checkin);
          this.checkin = checkin;
          this.checkin.reply = new Reply();
          this.checkin.reply.checkin_id = this.checkin.id;
          resolve(this.checkin);
        },
        (error:any) => {
          this.logger.error(this, "loadCheckin", checkinId, error);
          reject(error);
        });
      }
      else {
        reject("The Check-In for that token could not be found, please ensure the URL is correct and try again.");
      }
    });
  }

  private sendCheckinReply(event:any) {
    this.logger.info(this, "sendCheckinReply", this.checkin);
    if (this.checkin.reply.answer == null || this.checkin.reply.answer.length == 0) {
      this.showToast("Answer is required, please select your response");
    }
    else {
      let loading = this.showLoading("Sending...", true);
      this.api.tokenReply(this.checkin, this.checkin.reply, this.token).then((replied:Reply) => {
        this.logger.info(this, "sendCheckinReply", "Reply", replied);
        loading.dismiss();
        let alert = this.showAlert("Check-In Sent", "Your reply has been sent.");
        alert.onDidDismiss(data => {
          this.showNextPage();
        });
      },
      (error:any) => {
        loading.dismiss();
        this.showAlert("Problem Sending Reply", error);
      });
    }
  }

  private showNextPage(event:any=null) {
    this.hideModal();
    if (this.organization && this.user) {
      this.showRootPage(CheckinListPage, {
        organization: this.organization,
        user: this.user
      });
    }
    else {
      this.showModal(SigninUrlPage);
    }
  }

}
