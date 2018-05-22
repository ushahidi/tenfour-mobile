import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, Events, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { Badge } from '@ionic-native/badge';

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
import { StorageProvider } from '../../providers/storage/storage';
import { DatabaseProvider } from '../../providers/database/database';

@IonicPage({
  name: 'CheckinListPage',
  segment: 'checkins'
})
@Component({
  selector: 'page-checkin-list',
  templateUrl: 'checkin-list.html',
  providers: [ ApiProvider, DatabaseProvider ],
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
      protected badge:Badge,
      protected api:ApiProvider,
      protected database:DatabaseProvider,
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
        this.logger.info(this, "loadUpdates", "Done");
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

  private loadOrganization(cache:boolean=true):Promise<Organization> {
    return new Promise((resolve, reject) => {
      if (cache && this.organization) {
        resolve(this.organization);
      }
      else if (this.hasParameter("organization")){
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
      else if (this.hasParameter("user")){
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
      if (cache && this.mobile) {
        this.database.getCheckins(this.organization, this.limit, this.offset).then((checkins:Checkin[]) => {
          if (checkins && checkins.length > 0) {
            this.organization.checkins = checkins;
            this.checkins = this.filterCheckins(checkins);
            resolve(this.checkins);
          }
          else {
            this.loadCheckins(false).then((checkins:Checkin[]) => {
              this.organization.checkins = checkins;
              this.checkins = this.filterCheckins(checkins);
              resolve(this.checkins);
            },
            (error:any) => {
              this.organization.checkins = [];
              this.checkins = [];
              reject(error);
            });
          }
        });
      }
      else {
        this.api.getCheckins(this.organization, this.limit, this.offset).then((checkins:Checkin[]) => {
          for (let checkin of checkins) {
            for (let reply of checkin.replies) {
              if (this.user && this.user.id == reply.user_id) {
                checkin.replied = true;
              }
            }
          }
          if (this.mobile) {
            this.database.saveCheckins(this.organization, checkins).then((saved:boolean) => {
              this.database.getCheckins(this.organization, this.limit, this.offset).then((_checkins:Checkin[]) => {
                this.organization.checkins = _checkins;
                this.checkins = this.filterCheckins(_checkins);
                resolve(_checkins);
              },
              (error:any) => {
                this.checkins = checkins;
                resolve(checkins);
              });
            });
          }
          else {
            this.organization.checkins = checkins;
            this.checkins = this.filterCheckins(checkins);
            resolve(checkins);
          }
        },
        (error:any) => {
          this.organization.checkins = [];
          this.checkins = [];
          reject(error);
        });
      }
    });
  }

  private loadMore(event:any) {
    return new Promise((resolve, reject) => {
      this.offset = this.offset + this.limit;
      this.logger.info(this, "loadMore", "Limit", this.limit, "Offset", this.offset);
      this.api.getCheckins(this.organization, this.limit, this.offset).then((checkins:Checkin[]) => {
        if (this.mobile) {
          this.database.saveCheckins(this.organization, checkins).then((saved:boolean) => {
            this.organization.checkins = [...this.organization.checkins, ...checkins];
            this.checkins = [...this.checkins, ...this.filterCheckins(checkins)];
            if (event) {
              event.complete();
            }
            this.logger.info(this, "loadMore", "Limit", this.limit, "Offset", this.offset, "Total", this.organization.checkins.length);
            resolve(this.checkins);
          });
        }
        else {
          this.organization.checkins = [...this.organization.checkins, ...checkins];
          this.checkins = [...this.checkins, ...this.filterCheckins(checkins)];
          if (event) {
            event.complete();
          }
          this.logger.info(this, "loadMore", "Limit", this.limit, "Offset", this.offset, "Total", this.organization.checkins.length);
          resolve(this.checkins);
        }
      });
    });
  }

  private loadWaitingResponse() {
    if (this.mobile) {
      this.database.getCheckinsWaiting(this.organization, 25).then((waiting:Checkin[]) => {
        this.logger.info(this, "loadWaitingResponse", waiting.length);
        let checkins = [];
        for (let checkin of waiting) {
          if (checkin.canRespond(this.user)) {
            checkins.push(checkin);
          }
        }
        if (checkins.length > 0) {
          let modal = this.showModal(CheckinRespondPage, {
            organization: this.organization,
            checkins: checkins
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
        this.logger.error(this, "loadWaitingResponse", error);
      });
    }
    else {

    }
  }

  private loadBadgeNumber():Promise<number> {
    return new Promise((resolve, reject) => {
      if (this.mobile) {
        try {
          let badgeNumber = 0;
          if (this.organization && this.organization.checkins) {
            for (let checkin of this.organization.checkins) {
              if (checkin.canRespond(this.user)) {
                badgeNumber = badgeNumber + 1;
              }
            }
          }
          this.logger.info(this, "loadBadgeNumber", badgeNumber);
          this.badge.requestPermission().then((permission:any) => {
            this.logger.info(this, "loadBadgeNumber", badgeNumber, "Permission", permission);
            if (badgeNumber > 0) {
              this.badge.set(badgeNumber).then((result:any) => {
                this.logger.info(this, "loadBadgeNumber", badgeNumber, "Set", result);
                resolve(badgeNumber);
              },
              (error:any) => {
                this.logger.error(this, "loadBadgeNumber", badgeNumber, "Error", error);
                resolve(0);
              });
            }
            else {
              this.badge.clear().then((cleared:boolean) => {
                this.logger.info(this, "loadBadgeNumber", badgeNumber, "Clear", cleared);
                resolve(0);
              },
              (error:any) => {
                this.logger.error(this, "loadBadgeNumber", badgeNumber, "Error", error);
                resolve(0);
              });
            }
          });
        }
        catch(error) {
          this.logger.error(this, "loadBadgeNumber", "Error", error);
          resolve(0);
        }
      }
      else {
        resolve(0);
      }
    });
  }

  private showCheckinDetails(checkin:Checkin, event:any=null) {
    if (document.body.clientWidth > this.WIDTH_LARGE) {
      // this.showModal(CheckinDetailsPage, {
      //   organization: this.organization,
      //   person: this.user,
      //   checkin: checkin,
      //   checkin_id: checkin.id,
      //   modal: true
      // });
      // this.selected = checkin;
      this.events.publish('checkin:details', {
        checkin: checkin
      });
    }
    else {
      this.showPage(CheckinDetailsPage, {
        organization: this.organization,
        person: this.user,
        checkin: checkin,
        checkin_id: checkin.id
      });
    }
  }

  private sendReply(checkin:Checkin, event:any=null) {
    let modal = this.showModal(CheckinRespondPage, {
      organization: this.organization,
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
      person: this.user
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
