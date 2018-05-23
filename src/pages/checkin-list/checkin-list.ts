import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, Events, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { CheckinEditPage } from '../../pages/checkin-edit/checkin-edit';
import { CheckinDetailsPage } from '../../pages/checkin-details/checkin-details';
import { CheckinRespondPage } from '../../pages/checkin-respond/checkin-respond';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';
import { Checkin } from '../../models/checkin';
import { Notification } from '../../models/notification';

import { ApiProvider } from '../../providers/api/api';
import { BadgeProvider } from '../../providers/badge/badge';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'CheckinListPage',
  segment: 'checkins'
})
@Component({
  selector: 'page-checkin-list',
  templateUrl: 'checkin-list.html',
  providers: [ ApiProvider, StorageProvider, BadgeProvider ],
  entryComponents:[ CheckinEditPage, CheckinDetailsPage, CheckinRespondPage ]
})
export class CheckinListPage extends BasePage {

  filter:string = "all";
  organization:Organization = null;
  user:User = null;
  checkins:Checkin[] = [];
  selected:Checkin = null;
  loading:boolean = false;
  limit:number = 5;
  offset:number = 0;

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
      protected events:Events,
      protected badge:BadgeProvider,
      protected api:ApiProvider,
      protected storage:StorageProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
    let loading = this.showLoading("Loading...");
    this.limit = this.tablet ? 10 : 5;
    this.loadUpdates(false).then((finished:any) => {
      this.logger.info(this, "ionViewDidLoad", "loadUpdates", "Loaded");
      loading.dismiss();
      this.loadWaitingResponse();
    },
    (error:any) => {
      this.logger.error(this, "ionViewDidLoad", "loadUpdates", error);
      loading.dismiss();
    });
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.selected = null;
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    if (this.organization) {
      this.trackPage({
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
      .then(() => { return this.loadBadgeNumber(); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Loaded");
        if (event) {
          event.complete();
        }
        this.loading = false;
      })
      .catch((error:any) => {
        this.logger.error(this, "loadUpdates", "Failed", error);
        if (event) {
          event.complete();
        }
        this.loading = false;
        this.showToast(error);
      });
  }

  private loadOrganization(cache:boolean=true):Promise<Organization> {
    return new Promise((resolve, reject) => {
      if (cache && this.organization) {
        resolve(this.organization);
      }
      else if (cache && this.hasParameter("organization")){
        this.organization = this.getParameter<Organization>("organization");
        resolve(this.organization);
      }
      else {
        this.storage.getOrganization().then((organization:Organization) => {
          this.organization = organization;
          resolve(this.organization);
        });
      }
    });
  }

  private loadUser(cache:boolean=true):Promise<User> {
    return new Promise((resolve, reject) => {
      if (cache && this.user) {
        resolve(this.user);
      }
      else if (cache && this.hasParameter("user")){
        this.user = this.getParameter<User>("user");
        resolve(this.user);
      }
      else {
        this.storage.getUser().then((user:User) => {
          this.user = user;
          resolve(this.user);
        });
      }
    });
  }

  private loadCheckins(cache:boolean=true):Promise<Checkin[]> {
    return new Promise((resolve, reject) => {
      this.offset = 0;
      this.promiseFallback(cache,
        this.storage.getCheckins(this.organization, this.limit, this.offset),
        this.api.getCheckins(this.organization, this.limit, this.offset)).then((checkins:Checkin[]) => {
          for (let checkin of checkins) {
            for (let reply of checkin.replies) {
              if (this.user && this.user.id == reply.user_id) {
                checkin.replied = true;
              }
            }
          }
          this.storage.saveCheckins(this.organization, checkins).then((saved:boolean) => {
            this.organization.checkins = checkins;
            this.checkins = this.filterCheckins(checkins);
            resolve(this.checkins);
          });
        },
        (error:any) => {
          this.organization.checkins = [];
          this.checkins = [];
          reject(error);
        });
    });
  }

  private loadMore(event:any) {
    return new Promise((resolve, reject) => {
      this.offset = this.offset + this.limit;
      this.logger.info(this, "loadMore", "Limit", this.limit, "Offset", this.offset);
      this.promiseFallback(true,
        this.storage.getCheckins(this.organization, this.limit, this.offset),
        this.api.getCheckins(this.organization, this.limit, this.offset)).then((checkins:Checkin[]) => {
          this.storage.saveCheckins(this.organization, checkins).then((saved:boolean) => {
            this.organization.checkins = [...this.organization.checkins, ...checkins];
            this.checkins = [...this.checkins, ...this.filterCheckins(checkins)];
            if (event) {
              event.complete();
            }
            this.logger.info(this, "loadMore", "Limit", this.limit, "Offset", this.offset, "Loaded", this.organization.checkins.length);
            resolve(this.checkins);
          });
        },
        (error:any) => {
          this.logger.error(this, "loadMore", "Limit", this.limit, "Offset", this.offset, "Failed", error);
          reject(error);
        });
    });
  }

  private loadWaitingResponse() {
    this.logger.info(this, "loadWaitingResponse");
    this.promiseFallback(true,
      this.storage.getCheckinsWaiting(this.organization, this.user, 25),
      this.api.getCheckinsWaiting(this.organization, this.user, 25)).then((checkins:Checkin[]) => {
        if (checkins.length > 0) {
          this.logger.info(this, "loadWaitingResponse", checkins.length);
          let modal = this.showModal(CheckinRespondPage, {
            organization: this.organization,
            user: this.user,
            checkins: checkins,
            modal: true
          });
          modal.onDidDismiss(data => {
            if (data) {
              this.loadCheckins(false).then((loaded:any) => {
                this.loadBadgeNumber();
              },
              (error:any) => {

              });
            }
          });
        }
      },
      (error:any) => {
        this.logger.info(error, "loadWaitingResponse", error);
      });
  }

  private loadBadgeNumber():Promise<number> {
    return new Promise((resolve, reject) => {
      let badgeNumber = 0;
      if (this.organization && this.organization.checkins) {
        for (let checkin of this.organization.checkins) {
          if (checkin.canRespond(this.user)) {
            badgeNumber = badgeNumber + 1;
          }
        }
      }
      this.logger.info(this, "loadBadgeNumber", badgeNumber);
      this.badge.setBadgeNumber(badgeNumber).then((set:boolean) => {
        if (set) {
          this.logger.info(this, "loadBadgeNumber", badgeNumber, "Set");
        }
        else {
          this.logger.info(this, "loadBadgeNumber", badgeNumber, "Not Set");
        }
        resolve(badgeNumber);
      });
    });
  }

  private showCheckinDetails(checkin:Checkin, event:any=null) {
    if (document.body.clientWidth > this.WIDTH_LARGE) {
      this.events.publish('checkin:details', {
        checkin: checkin
      });
    }
    else if (document.body.clientWidth > this.WIDTH_MEDIUM) {
      this.showModal(CheckinDetailsPage, {
        organization: this.organization,
        user: this.user,
        person: this.user,
        checkin: checkin,
        checkin_id: checkin.id,
        modal: true
      });
    }
    else {
      this.showPage(CheckinDetailsPage, {
        organization: this.organization,
        user: this.user,
        person: this.user,
        checkin: checkin,
        checkin_id: checkin.id
      });
    }
  }

  private sendReply(checkin:Checkin, event:any=null) {
    let modal = this.showModal(CheckinRespondPage, {
      organization: this.organization,
      user: this.user,
      checkins: [checkin],
      checkin: checkin
    });
    modal.onDidDismiss(data => {
      this.logger.info(this, "sendReply", "Modal", data);
      if (data) {
        if (data.canceled) {
          this.logger.info(this, "sendReply", "Modal", "Canceled");
        }
        else {
          this.loadCheckins(false);
        }
      }
   });
  }

  private resendCheckin(checkin:Checkin, event:any=null) {
    let loading = this.showLoading("Resending...");
    this.api.resendCheckin(this.organization, checkin).then((checkin:Checkin) => {
      loading.dismiss();
      this.showToast(`Check-In ${checkin.message} resent`);
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Resending Check-In", error);
    });
  }

  private createCheckin(event:any) {
    let modal = this.showModal(CheckinEditPage, {
      organization: this.organization,
      user: this.user
    });
    modal.onDidDismiss(data => {
      this.logger.info(this, "createCheckin", "Modal", data);
      if (data) {
        if (data.canceled) {
          this.logger.info(this, "createCheckin", "Modal", "Canceled");
        }
        else {
          this.loadCheckins(false);
        }
      }
    });
  }

  private filterChanged(event:any) {
    this.logger.info(this, "filterChanged", this.filter);
    let loading = this.showLoading("Filtering...");
    this.loading = true;
    this.offset = 0;
    this.checkins = [];
    this.loadCheckins(true).then((filtered:any) => {
      this.loading = false;
      loading.dismiss();
    });
  }

  private filterCheckins(checkins:Checkin[]) {
    let filtered = [];
    for (let checkin of checkins) {
      if (this.filter === "all") {
        filtered.push(checkin);
      }
      else if (this.filter === "waiting") {
        if (checkin.canRespond(this.user)) {
          filtered.push(checkin);
        }
      }
    }
    this.logger.info(this, "filterCheckins", this.filter, "Checkins", checkins.length, "Filtered", filtered.length);
    return filtered;
  }

  private swipeEvent(event:any) {
    if(event.direction == '2'){
      this.logger.info(this, "swipeEvent", event, "Left");
      this.filter = "all";
    }
    else if(event.direction == '4'){
      this.logger.info(this, "swipeEvent", event, "Right");
      this.filter = "waiting";
    }
  }

}
