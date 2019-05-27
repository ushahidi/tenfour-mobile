import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';
import { CheckinEditPage } from '../../pages/checkin-edit/checkin-edit';
import { CheckinDetailsPage } from '../../pages/checkin-details/checkin-details';
import { CheckinRespondPage } from '../../pages/checkin-respond/checkin-respond';
import { CheckinTestPage } from '../../pages/checkin-test/checkin-test';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';
import { Checkin } from '../../models/checkin';
import { Notification } from '../../models/notification';

import { ApiProvider } from '../../providers/api/api';
import { BadgeProvider } from '../../providers/badge/badge';
import { StorageProvider } from '../../providers/storage/storage';

import {
  EVENT_CHECKIN_CREATED,
  EVENT_CHECKIN_UPDATED,
  EVENT_CHECKINS_WAITING_CHANGED } from '../../constants/events';

export enum Filter {
  sent = "sent",
  inbox = "inbox",
  scheduled = "scheduled"
}

@IonicPage({
  name: 'CheckinListPage',
  segment: 'checkins'
})
@Component({
  selector: 'page-checkin-list',
  templateUrl: 'checkin-list.html',
  providers: [ ApiProvider, StorageProvider, BadgeProvider ],
  entryComponents:[ CheckinEditPage, CheckinDetailsPage, CheckinRespondPage, CheckinTestPage ]
})
export class CheckinListPage extends BasePrivatePage {

  Filter:any = Filter;
  filter:Filter = Filter.sent;
  checkins:Checkin[] = [];
  selected:Checkin = null;
  loading:boolean = false;
  limit:number = 5;
  offset:number = 0;
  badgeNumber:number = 0;

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
      protected badge:BadgeProvider,
      protected api:ApiProvider,
      protected storage:StorageProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
    this.limit = this.tablet || this.website ? 10 : 5;
    let loading = this.showLoading("Loading...");
    this.loadUpdates(false).then((loaded:any) => {
      loading.dismiss();
      this.loadInboxCheckins(true, this.mobile).then((waiting:Checkin[]) => {
        this.logger.info(this, "ionViewDidLoad", "loadInboxCheckins", "Loaded");
      },
      (error:any) => {
        this.logger.error(this, "ionViewDidLoad", "loadInboxCheckins", error);
      });
    },
    (error:any) => {
      this.logger.error(this, "ionViewDidLoad", "loadUpdates", error);
    });
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.selected = null;
    this.events.subscribe(EVENT_CHECKIN_CREATED, (checkinId:number, data:any) => {
      this.logger.info(this, EVENT_CHECKIN_CREATED, checkinId, data);
      let message = ["You received a new Check-In"];
      if (data && data['sender_name']) {
        message.push(` from ${data['sender_name']}`)
      }
      if (data && data['msg']) {
        message.push(`, ${data['msg']}`);
      }
      this.showConfirm("Check-In Received", message.join(""), [
        {
          text: 'View',
          handler: () => {
            let loading = this.showLoading("Loading...");
            this.loadInboxCheckins(false).then((checkins:Checkin[]) => {
              loading.dismiss();
              let checkin = checkins.find(checkin => checkin.id == checkinId);
              this.logger.info(this, EVENT_CHECKIN_CREATED, checkinId, "showCheckinDetails", checkin);
              this.showCheckinDetails(checkin);
            },
            (error:any) => {
              loading.dismiss();
            });
          }
        },
        {
          text: 'Ignore',
          role: 'cancel',
          handler: () => {
            let loading = this.showLoading("Loading...");
            this.loadCheckins(false).then((checkins:Checkin[]) => {
              loading.dismiss();
            },
            (error:any) => {
              loading.dismiss();
            })
          }
        }
      ]);
    });
    this.events.subscribe(EVENT_CHECKIN_UPDATED, (checkinId:number) => {
      this.logger.info(this, EVENT_CHECKIN_UPDATED, checkinId);
      this.loadCheckin(checkinId).then((checkin:Checkin) => {
        if (checkin) {
          this.logger.info(this, EVENT_CHECKIN_UPDATED, checkinId, "Loaded");
        }
        else {
          this.logger.warn(this, EVENT_CHECKIN_UPDATED, checkinId, "Not Loaded");
        }
      });
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

  ionViewWillLeave() {
    super.ionViewWillLeave();
    this.events.unsubscribe(EVENT_CHECKIN_CREATED);
    this.events.unsubscribe(EVENT_CHECKIN_UPDATED);
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
      .catch((error:any) => {
        this.logger.error(this, "loadUpdates", "Failed", error);
        if (event) {
          event.complete();
        }
        this.loading = false;
        if (error === "Unable to authenticate with invalid API key and token.") {
          this.showAlert("Problem Logging In", error);
        }
        else {
          this.showToast(error);
        }
      });
  }

  private loadCheckins(cache:boolean=true):Promise<Checkin[]> {
    return new Promise((resolve, reject) => {
      this.offset = 0;
      this.checkins = [];
      let loadCheckins:Promise<Checkin[]> = null;
      if (this.filter === Filter.sent) {
        loadCheckins = this.loadSentCheckins(cache);
      }
      else if (this.filter === Filter.inbox) {
        loadCheckins = this.loadInboxCheckins(cache);
      }
      else if (this.filter === Filter.scheduled) {
        loadCheckins = this.loadScheduledCheckins(cache);
      }
      loadCheckins.then((checkins:Checkin[]) => {
        this.organization.checkins = checkins;
        this.checkins = checkins;
        resolve(this.checkins);
      },
      (error:any) => {
        this.logger.error(this, "loadCheckins", error);
        reject(error);
      });
    });
  }

  private loadMoreCheckins(event:any) {
    return new Promise((resolve, reject) => {
      this.offset = this.offset + this.limit;
      let loadMoreCheckins:Promise<Checkin[]> = null;
      if (this.filter === Filter.sent) {
        loadMoreCheckins = this.loadSentCheckins(true);
      }
      else if (this.filter === Filter.inbox) {
        loadMoreCheckins = this.loadInboxCheckins(true);
      }
      else if (this.filter === Filter.scheduled) {
        loadMoreCheckins = this.loadScheduledCheckins(true);
      }
      loadMoreCheckins.then((checkins:Checkin[]) => {
        this.organization.checkins = [...this.organization.checkins, ...checkins];
        this.checkins = [...this.checkins, ...checkins];
        if (event) {
          event.complete();
        }
        resolve(this.checkins);
      },
      (error:any) => {
        this.logger.error(this, "loadMoreCheckins", error);
        if (event) {
          event.complete();
        }
        reject(error);
      });
    });
  }

  private loadSentCheckins(cache:boolean=true):Promise<Checkin[]> {
    return new Promise((resolve, reject) => {
      this.promiseFallback(cache,
        this.storage.getCheckins(this.organization, this.limit, this.offset),
        this.api.getCheckins(this.organization, this.limit, this.offset), 1).then((checkins:Checkin[]) => {
          this.logger.info(this, "loadSentCheckins", checkins.length);
          for (let checkin of checkins) {
            for (let reply of checkin.replies) {
              if (this.user && this.user.id == reply.user_id) {
                checkin.replied = true;
              }
            }
          }
          this.storage.saveCheckins(this.organization, checkins).then((saved:boolean) => {
            resolve(checkins);
          },
          (error:any) => {
            this.logger.error(this, "loadSentCheckins", error);
            reject(error);
          });
        },
        (error:any) => {
          this.logger.error(this, "loadSentCheckins", error);
          reject(error);
        });
    });
  }

  private loadInboxCheckins(cache:boolean=true, showPopup:boolean=false):Promise<Checkin[]> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadInboxCheckins");
      this.promiseFallback(cache,
        this.storage.getCheckinsWaiting(this.organization, this.user, 25, this.offset),
        this.api.getCheckinsWaiting(this.organization, this.user, 25, this.offset), 1).then((checkins:Checkin[]) => {
          if (checkins && checkins.length > 0) {
            this.logger.info(this, "loadInboxCheckins", checkins.length);
            this.events.publish(EVENT_CHECKINS_WAITING_CHANGED, checkins);
            this.badgeNumber = checkins.length;
            this.badge.setBadgeNumber(this.badgeNumber);
            if (showPopup == true) {
              let checkin = checkins[0];
              this.showCheckinRespond(checkin, checkins);
            }
            resolve(checkins);
          }
          else {
            this.logger.info(this, "loadInboxCheckins", 0);
            this.badgeNumber = 0;
            this.badge.clearBadgeNumber();
            resolve([]);
          }
        },
        (error:any) => {
          this.logger.info(this, "loadInboxCheckins", error);
          resolve([]);
        });
    });
  }

  private loadScheduledCheckins(cache:boolean=true):Promise<Checkin[]> {
    return new Promise((resolve, reject) => {
      this.api.getCheckinsScheduled(this.organization, this.limit, this.offset).then((checkins:Checkin[]) => {
        this.logger.info(this, "loadScheduledCheckins", checkins.length);
        resolve(checkins);
      },
      (error:any) => {
        this.logger.error(this, "loadScheduledCheckins", error);
        reject(error);
      });
    });
  }

  private loadCheckin(checkinId:number):Promise<Checkin> {
    return new Promise((resolve, reject) => {
      this.api.getCheckin(this.organization, checkinId).then((checkin:Checkin) => {
        for (let index in this.checkins) {
          let _checkin = this.checkins[index];
          if (_checkin.id === checkin.id) {
            this.checkins[index] = checkin;
            this.logger.info(this, "loadCheckin", checkinId, "Loaded");
            resolve(checkin);
            break;
          }
        }
        resolve(null);
      },
      (error:any) => {
        this.logger.error(this, "loadCheckin", checkinId, error);
        resolve(null);
      });
    });
  }

  private showCheckinDetails(checkin:Checkin) {
    if (checkin) {
      this.showModalOrPage(CheckinDetailsPage, {
        organization: this.organization,
        user: this.user,
        person: this.user,
        checkin: checkin,
        checkin_id: checkin.id
      });
    }
  }

  private showCheckinRespond(checkin:Checkin, checkins:Checkin[]=null) {
    this.logger.info(this, "showCheckinRespond", checkin);
    let modal = this.showModal(CheckinRespondPage, {
      organization: this.organization,
      user: this.user,
      checkins: checkins || [checkin],
      checkin: checkin
    });
    modal.onDidDismiss(data => {
      this.logger.info(this, "showCheckinRespond", "Modal", data);
      if (data) {
        if (data.canceled) {
          this.logger.info(this, "showCheckinRespond", "Modal", "Canceled");
        }
        else {
          this.loadCheckins(false).then((loaded:any) => {
            this.logger.info(this, "showCheckinRespond", "loadCheckins", "Loaded");
            this.loadInboxCheckins(true, false);
          },
          (error:any) => {
            this.logger.info(this, "showCheckinRespond", "loadCheckins", error);
          });
        }
      }
   });
  }

  private resendCheckin(checkin:Checkin) {
    let loading = this.showLoading("Resending...", true);
    this.api.resendCheckin(this.organization, checkin).then((checkin:Checkin) => {
      loading.dismiss();
      this.showToast(`Check-In ${checkin.message} resent`);
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Resending Check-In", error);
    });
  }

  private deleteCheckin(checkin:Checkin) {
    this.logger.info(this, "deleteCheckin", checkin);
    let buttons = [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          this.logger.info(this, "save", "Cancelled");
        }
      },
      {
        text: 'Delete',
        handler: () => {
          let loading = this.showLoading("Deleting...", true);
          this.api.deleteCheckinScheduled(this.organization, checkin).then((deleted:any) => {
            this.loadScheduledCheckins(true).then((checkins:Checkin[]) => {
              this.organization.checkins = checkins;
              this.checkins = checkins;
              loading.dismiss();
              this.showToast(`Check-In ${checkin.message} deleted`);
            },
            (error:any) => {
              loading.dismiss();
              this.showAlert("Problem Loading Scheduled Check-ins", error);
            });
          },
          (error:any) => {
            loading.dismiss();
            this.showAlert("Problem Deleting Scheduled Check-Ins", error);
          });
        }
      }
    ];
    this.showConfirm("Are you sure?", "Deleting all scheduled check-ins in this set can't be undone.", buttons);
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
          this.loadCheckins(false).then((loaded:any) => {
            this.logger.info(this, "createCheckin", "loadCheckins", "Loaded");
            this.loadInboxCheckins(true, false).then((checkins:Checkin[]) =>{
              this.logger.info(this, "createCheckin", "loadCheckins", "loadInboxCheckins", "Loaded");
            },
            (error:any) => {
              this.logger.error(this, "createCheckin", "loadCheckins", "loadInboxCheckins", error);
            });
          },
          (error:any) => {
            this.logger.error(this, "createCheckin", "loadCheckins", error);
          });
        }
      }
    });
  }

  private testCheckin(event:any) {
    this.logger.info(this, "testCheckin");
    let modal = this.showModal(CheckinTestPage, {
      organization: this.organization,
      user: this.user
    });
    modal.onDidDismiss(data => {
      this.logger.info(this, "testCheckin", "Modal", data);
      if (data) {
        this.user.config_self_test_sent = true;
        this.loadUpdates();
      }
      else {
        this.user.config_self_test_sent = false;
      }
    });
  }

  private filterChanged(event:any) {
    this.logger.info(this, "filterChanged", this.filter);
    let loading = this.showLoading("Loading...");
    this.loading = true;
    this.loadCheckins(true).then((checkins:Checkin[]) => {
      this.loading = false;
      loading.dismiss();
    },
    (error:any) => {
      this.loading = false;
      loading.dismiss();
    });
  }

}
