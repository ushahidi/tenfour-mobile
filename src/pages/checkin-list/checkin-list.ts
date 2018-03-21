import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Button, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { Badge } from '@ionic-native/badge';

import { BasePage } from '../../pages/base-page/base-page';
import { CheckinEditPage } from '../../pages/checkin-edit/checkin-edit';
import { ReplyListPage } from '../../pages/reply-list/reply-list';
import { ReplySendPage } from '../../pages/reply-send/reply-send';
import { NotificationListPage } from '../../pages/notification-list/notification-list';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Checkin } from '../../models/checkin';
import { Notification } from '../../models/notification';

@IonicPage()
@Component({
  selector: 'page-checkin-list',
  templateUrl: 'checkin-list.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[ CheckinEditPage, ReplyListPage, ReplySendPage, NotificationListPage ]
})
export class CheckinListPage extends BasePage {

  filter:string = "all";
  organization:Organization = null;
  checkins:Checkin[] = [];
  notifications:Notification[] = [];
  person:Person = null;
  loading:boolean = false;
  notify:boolean = false;
  limit:number = 10;
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
      protected badge:Badge,
      protected api:ApiService,
      protected database:DatabaseService) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
    this.organization = this.getParameter<Organization>("organization");
    this.person = this.getParameter<Person>("person");
    let loading = this.showLoading("Loading...");
    this.loadUpdates(false).then((finished:any) => {
      loading.dismiss();
      if (this.organization.checkins) {
        let checkins = [];
        for (let checkin of this.organization.checkins) {
          if (checkin.canRespond(this.person)) {
            checkins.push(checkin);
          }
        }
        if (checkins.length > 0) {
          let modal = this.showModal(ReplySendPage, {
            organization: this.organization,
            checkins: checkins });
          modal.onDidDismiss(data => {
            if (data) {
              this.loadRollCalls(false).then(loaded => {
                this.loadBadgeNumber();
              })
            }
          });
        }
      }
    },
    (error:any) => {
      loading.dismiss();
    });
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    if (this.loading == false) {
      this.loadNotifications(true);
    }
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.trackPage({
      organization: this.organization.name
    });
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    this.loading = true;
    return Promise.resolve()
      .then(() => { return this.loadPerson(cache); })
      .then(() => { return this.loadOrganization(cache); })
      .then(() => { return this.loadRollCalls(cache); })
      .then(() => { return this.loadNotifications(cache); })
      .then(() => { return this.loadBadgeNumber(); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Done");
        if (event) {
          event.complete();
        }
        this.loading = false;
      })
      .catch((error) => {
        if (event) {
          event.complete();
        }
        this.loading = false;
        this.showToast(error);
      });
  }

  private loadBadgeNumber():Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        let badgeNumber = 0;
        if (this.organization && this.organization.checkins) {
          for (let checkin of this.organization.checkins) {
            if (checkin.canRespond(this.person)) {
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
    });
  }

  private loadMore(event:any) {
    return new Promise((resolve, reject) => {
      this.offset = this.offset + this.limit;
      this.logger.info(this, "loadMore", "Limit", this.limit, "Offset", this.offset);
      this.api.getCheckins(this.organization, this.limit, this.offset).then((checkins:Checkin[]) => {
        let saves = [];
        for (let checkin of checkins) {
          saves.push(this.database.saveCheckin(this.organization, checkin));
        }
        Promise.all(saves).then(saved => {
          this.organization.checkins = [...this.organization.checkins, ...checkins];
          this.checkins = [...this.checkins, ...this.filterCheckins(checkins)];
          if (event) {
            event.complete();
          }
          this.logger.info(this, "loadMore", "Limit", this.limit, "Offset", this.offset, "Total", this.organization.checkins.length);
          resolve(this.checkins);
        },
        (error:any) => {
          this.logger.error(this, "loadMore", "Limit", this.limit, "Offset", this.offset, "Error", error);
          if (event) {
            event.complete();
          }
          resolve(this.checkins);
        });
      });
    });
  }

  private loadPerson(cache:boolean=true):Promise<Person> {
    return new Promise((resolve, reject) => {
      if (cache) {
        this.database.getPerson(null, true).then((person:Person) => {
          if (person) {
            this.person = person;
            resolve(person);
          }
          else {
            this.loadPerson(false).then((person:Person) => {
              resolve(person);
            },
            (error:any) => {
              reject(error);
            });
          }
        },
        (error:any) => {
          this.loadPerson(false).then((person:Person) => {
            resolve(person);
          },
          (error:any) => {
            reject(error);
          });
        });
      }
      else {
        this.api.getPerson(this.organization, "me").then((person:Person) => {
          this.database.savePerson(this.organization, person).then(saved => {
            this.person = person;
            resolve(person);
          });
        },
        (error:any) => {
          reject(error);
        });
      }
    });
  }

  private loadOrganization(cache:boolean=true):Promise<Organization> {
    return new Promise((resolve, reject) => {
      if (cache) {
        resolve(this.organization);
      }
      else {
        this.api.getOrganization(this.organization).then((organization:Organization) => {
          this.database.saveOrganization(this.organization).then(saved => {
            this.organization = organization;
            resolve(organization);
          });
        },
        (error:any) => {
          reject(error);
        });
      }
    });
  }

  private loadRollCalls(cache:boolean=true):Promise<Checkin[]> {
    return new Promise((resolve, reject) => {
      if (cache) {
        this.database.getCheckins(this.organization, this.limit, this.offset).then((checkins:Checkin[]) => {
          if (checkins && checkins.length > 0) {
            this.organization.checkins = checkins;
            this.checkins = this.filterCheckins(checkins);
            resolve(this.checkins);
          }
          else {
            this.loadRollCalls(false).then((checkins:Checkin[]) => {
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
          if (checkins && checkins.length > 0) {
            let saves = [];
            for (let checkin of checkins) {
              for (let answer of checkin.answers) {
                saves.push(this.database.saveAnswer(checkin, answer));
              }
              for (let recipient of checkin.recipients) {
                saves.push(this.database.saveRecipient(checkin, recipient));
              }
              for (let reply of checkin.replies) {
                saves.push(this.database.saveReply(checkin, reply));
                if (this.person && this.person.id == reply.user_id) {
                  checkin.replied = true;
                }
              }
              saves.push(this.database.saveCheckin(this.organization, checkin));
            }
            Promise.all(saves).then(saved => {
              this.database.getCheckins(this.organization, this.limit, this.offset).then((_checkins:Checkin[]) => {
                this.organization.checkins = _checkins;
                this.checkins = this.filterCheckins(_checkins);
                resolve(_checkins);
              });
            });
          }
          else {
            this.organization.checkins = [];
            this.checkins = [];
            resolve([]);
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

  private loadNotifications(cache:boolean=true):Promise<any> {
    this.notify = false;
    return new Promise((resolve, reject) => {
      if (cache) {
        this.database.getNotifications(this.organization, 10, 0).then((notifications:Notification[]) => {
          this.notifications = notifications;
          for (let notification of notifications) {
            if (notification.viewed_at == null) {
              this.notify = true;
            }
          }
          resolve(notifications);
        });
      }
      else {
        this.api.getNotifications(this.organization).then((notifications:Notification[]) => {
          let saves = [];
          for (let notification of notifications) {
            saves.push(this.database.saveNotification(this.organization, notification));
          }
          Promise.all(saves).then(saved => {
            this.database.getNotifications(this.organization, 10, 0).then((_notifications:Notification[]) => {
              this.notifications = _notifications;
              for (let notification of _notifications) {
                if (notification.viewed_at == null) {
                  this.notify = true;
                }
              }
              resolve(_notifications);
            },
            (error:any) => {
              resolve(notifications);
            });
          });
        },
        (error:any) => {
          reject(error);
        });
      }
    });
  }

  private showReplies(event:any, checkin:Checkin) {
    this.showPage(ReplyListPage, {
      organization: this.organization,
      person: this.person,
      checkin: checkin })
  }

  private sendReply(event:any, checkin:Checkin) {
    let modal = this.showModal(ReplySendPage, {
      organization: this.organization,
      checkin: checkin });
    modal.onDidDismiss(data => {
      this.logger.info(this, "sendReply", "Modal", data);
      if (data) {
        if (data.canceled) {
          this.logger.info(this, "sendReply", "Modal", "Canceled");
        }
        else {
          this.loadRollCalls(false);
        }
      }
   });
  }

  private createCheckin(event:any) {
    let modal = this.showModal(CheckinEditPage, {
      organization: this.organization,
      person: this.person });
    modal.onDidDismiss(data => {
      this.logger.info(this, "createCheckin", "Modal", data);
      if (data) {
        if (data.canceled) {
          this.logger.info(this, "createCheckin", "Modal", "Canceled");
        }
        else {
          this.loadRollCalls(false);
        }
      }
    });
  }

  private showNotifications(event:any) {
    this.showPage(NotificationListPage, {
      organization: this.organization,
      person: this.person,
      notifications: this.notifications });
  }

  private filterChanged(event:any) {
    this.logger.info(this, "filterChanged", this.filter);
    let loading = this.showLoading("Filtering...");
    this.loadRollCalls(true).then((filtered:any) => {
      loading.dismiss();
    })
  }

  private filterCheckins(checkins:Checkin[]) {
    let filtered = [];
    for (let checkin of checkins) {
      if (this.filter === "all") {
        filtered.push(checkin);
      }
      else if (this.filter === "waiting") {
        if (checkin.canRespond(this.person)) {
          filtered.push(checkin);
        }
      }
    }
    this.logger.info(this, "filterCheckins", this.filter, "Checkins", checkins.length, "Filtered", filtered.length);
    return filtered;
  }

}
