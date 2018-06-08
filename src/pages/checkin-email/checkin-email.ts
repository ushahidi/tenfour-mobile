import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Slides, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { CheckinRespondPage } from '../../pages/checkin-respond/checkin-respond';

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
  name: 'CheckinEmailPage',
  segment: 'checkins/email/:checkin_id/:answer_id/:user_id/:token'
})
@Component({
  selector: 'page-checkin-email',
  templateUrl: 'checkin-email.html',
  entryComponents:[ CheckinRespondPage ]
})
export class CheckinEmailPage extends BasePage {

  organization:Organization = null;
  user:User = null;
  checkin:Checkin = null;
  token:string = null;
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
    protected storage:StorageProvider) {
    super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    let loading = this.showLoading("Loading...");
    this.loadUpdates(false).then((finished:any) => {
      this.logger.info(this, "ionViewDidLoad", "loadUpdates", "Loaded");
      loading.dismiss();
    },
    (error:any) => {
      this.logger.error(this, "ionViewDidLoad", "loadUpdates", error);
      loading.dismiss();
    });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    this.loading = true;
    return Promise.resolve()
      .then(() => { return this.loadUser(cache); })
      .then(() => { return this.loadToken(cache); })
      .then(() => { return this.loadCheckin(cache); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Loaded");
        if (event) {
          event.complete();
        }
        this.loading = false;
        this.showCheckinRespond();
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

  private loadUser(cache:boolean=true):Promise<User> {
    return new Promise((resolve, reject) => {
      if (cache && this.user) {
        resolve(this.user);
      }
      else if (this.hasParameter("user")){
        this.user = this.getParameter<User>("user");
        resolve(this.user);
      }
      else if (this.hasParameter("user_id")){
        let userId = this.getParameter<number>("user_id");
        this.promiseFallback(cache,
          this.storage.getPerson(this.organization, userId),
          this.api.getPerson(this.organization, userId)).then((person:Person) => {
            this.user = person;
            resolve(person);
        },
        (error:any) => {
          resolve(null);
        });
      }
      else {
        this.storage.getUser().then((user:User) => {
          this.user = user;
          resolve(this.user);
        },
        (error:any) => {
          reject("Problem loading user");
        });
      }
    });
  }

  private loadToken(cache:boolean=true):Promise<string> {
    return new Promise((resolve, reject) => {
      if (cache && this.token) {
        resolve(this.token);
      }
      else if (this.hasParameter("token")){
        this.token = this.getParameter<string>("token");
        resolve(this.token);
      }
      else {
        this.token = null;
        resolve(null);
      }
    })
  }

  private loadCheckin(cache:boolean=true):Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (cache && this.checkin) {
        resolve(true);
      }
      else if (this.hasParameter("checkin_id")){
        let checkinId = this.getParameter<number>("checkin_id");
        this.logger.info(this, "loadCheckins", "ID", checkinId);
        this.promiseFallback(cache,
          this.storage.getCheckin(this.organization, checkinId),
          this.api.getCheckin(this.organization, checkinId)).then((checkin:Checkin) => {
            this.logger.info(this, "loadCheckins", "Checkin", checkin);
            this.storage.saveCheckin(this.organization, checkin).then((saved:boolean) => {
              checkin.reply = new Reply();
              checkin.reply.organization_id = this.organization.id;
              checkin.reply.checkin_id = checkin.id;
              this.checkin = checkin;
              resolve(true);
            });
          },
          (error:any) => {
            reject(error);
          });
      }
      else {
        reject("Checkin not provided");
      }
    });
  }

  private showCheckinRespond() {
    this.logger.info(this, "showCheckinRespond");
    let modal = this.showModal(CheckinRespondPage, {
      organization: this.organization,
      user: this.user,
      checkins: [this.checkin],
      checkin: this.checkin,
      token: this.token,
      modal: true
    });
  }

}
