import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Button, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { RollcallEditPage } from '../../pages/rollcall-edit/rollcall-edit';
import { ReplyListPage } from '../../pages/reply-list/reply-list';
import { ReplySendPage } from '../../pages/reply-send/reply-send';
import { NotificationListPage } from '../../pages/notification-list/notification-list';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Rollcall } from '../../models/rollcall';
import { Notification } from '../../models/notification';

@IonicPage()
@Component({
  selector: 'page-rollcall-list',
  templateUrl: 'rollcall-list.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[ RollcallEditPage, ReplyListPage, ReplySendPage, NotificationListPage ]
})
export class RollcallListPage extends BasePage {

  filter:string = "all";
  organization:Organization = null;
  rollcalls:Rollcall[] = [];
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
      if (this.organization.rollcalls) {
        let rollcalls = [];
        for (let rollcall of this.organization.rollcalls) {
          if (rollcall.canRespond(this.person)) {
            rollcalls.push(rollcall);
          }
        }
        if (rollcalls.length > 0) {
          let modal = this.showModal(ReplySendPage, {
            organization: this.organization,
            rollcalls: rollcalls });
          modal.onDidDismiss(data => {
            if (data) {
              this.loadRollCalls(false);
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

  loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    this.loading = true;
    return Promise.resolve()
      .then(() => { return this.loadPerson(cache); })
      .then(() => { return this.loadOrganization(cache); })
      .then(() => { return this.loadRollCalls(cache); })
      .then(() => { return this.loadNotifications(cache); })
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

  loadMore(event:any) {
    return new Promise((resolve, reject) => {
      this.offset = this.offset + this.limit;
      this.logger.info(this, "loadMore", "Limit", this.limit, "Offset", this.offset);
      this.database.getRollcalls(this.organization, this.limit, this.offset).then((rollcalls:Rollcall[]) => {
        this.organization.rollcalls = [...this.organization.rollcalls, ...rollcalls];
        this.rollcalls = [...this.rollcalls, ...this.filterRollcalls(rollcalls)];
        if (event) {
          event.complete();
        }
        this.logger.info(this, "loadMore", "Limit", this.limit, "Offset", this.offset, "Total", this.organization.rollcalls.length);
        resolve(this.rollcalls);
      });
    });
  }

  loadPerson(cache:boolean=true):Promise<Person> {
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

  loadOrganization(cache:boolean=true):Promise<Person> {
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

  loadRollCalls(cache:boolean=true):Promise<Rollcall[]> {
    return new Promise((resolve, reject) => {
      if (cache) {
        this.database.getRollcalls(this.organization, this.limit, this.offset).then((rollcalls:Rollcall[]) => {
          if (rollcalls && rollcalls.length > 0) {
            this.organization.rollcalls = rollcalls;
            this.rollcalls = this.filterRollcalls(rollcalls);
            resolve(this.rollcalls);
          }
          else {
            this.loadRollCalls(false).then((rollcalls:Rollcall[]) => {
              this.organization.rollcalls = rollcalls;
              this.rollcalls = this.filterRollcalls(rollcalls);
              resolve(this.rollcalls);
            },
            (error:any) => {
              this.organization.rollcalls = [];
              this.rollcalls = [];
              reject(error);
            });
          }
        });
      }
      else {
        this.api.getRollcalls(this.organization).then((rollcalls:Rollcall[]) => {
          if (rollcalls && rollcalls.length > 0) {
            let saves = [];
            for (let rollcall of rollcalls) {
              for (let answer of rollcall.answers) {
                saves.push(this.database.saveAnswer(rollcall, answer));
              }
              for (let recipient of rollcall.recipients) {
                saves.push(this.database.saveRecipient(rollcall, recipient));
              }
              for (let reply of rollcall.replies) {
                saves.push(this.database.saveReply(rollcall, reply));
                if (this.person && this.person.id == reply.user_id) {
                  rollcall.replied = true;
                }
              }
              saves.push(this.database.saveRollcall(this.organization, rollcall));
            }
            Promise.all(saves).then(saved => {
              this.database.getRollcalls(this.organization, this.limit, this.offset).then((_rollcalls:Rollcall[]) => {
                this.organization.rollcalls = _rollcalls;
                this.rollcalls = this.filterRollcalls(_rollcalls);
                resolve(_rollcalls);
              });
            });
          }
          else {
            this.organization.rollcalls = [];
            this.rollcalls = [];
            resolve([]);
          }
        },
        (error:any) => {
          this.organization.rollcalls = [];
          this.rollcalls = [];
          reject(error);
        });
      }
    });
  }

  loadNotifications(cache:boolean=true):Promise<any> {
    this.notify = false;
    return new Promise((resolve, reject) => {
      if (cache) {
        this.database.getNotifications(this.organization, 10, 0).then((notifications:Notification[]) => {
          this.notifications = notifications;
          for (let notification of notifications) {
            if (notification.viewed_at) {
              this.logger.info(this, "loadNotifications", "Viewed", notification.id, notification.viewed_at);
            }
            else {
              this.logger.error(this, "loadNotifications", "New", notification.id);
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
                if (notification.viewed_at) {
                  this.logger.info(this, "loadNotifications", "Viewed", notification.id, notification.viewed_at);
                }
                else {
                  this.logger.error(this, "loadNotifications", "New", notification.id);
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

  showReplies(event:any, rollcall:Rollcall) {
    this.showPage(ReplyListPage, {
      organization: this.organization,
      person: this.person,
      rollcall: rollcall })
  }

  sendReply(event:any, rollcall:Rollcall) {
    let modal = this.showModal(ReplySendPage, {
      organization: this.organization,
      rollcall: rollcall });
    modal.onDidDismiss(data => {
      if (data) {
        this.loadRollCalls(false);
      }
   });
  }

  createRollcall(event:any) {
    let modal = this.showModal(RollcallEditPage, {
      organization: this.organization,
      person: this.person });
    modal.onDidDismiss(data => {
      if (data) {
        this.loadRollCalls(false);
      }
    });
  }

  showNotifications(event:any) {
    this.showPage(NotificationListPage, {
      organization: this.organization,
      person: this.person,
      notifications: this.notifications });
  }

  filterChanged(event:any) {
    this.logger.info(this, "filterChanged", this.filter);
    let loading = this.showLoading("Filtering...");
    this.loadRollCalls(true).then((filtered:any) => {
      loading.dismiss();
    })
  }

  filterRollcalls(rollcalls:Rollcall[]) {
    let filtered = [];
    for (let rollcall of rollcalls) {
      if (this.filter === "all") {
        filtered.push(rollcall);
      }
      else if (this.filter === "waiting") {
        if (rollcall.canRespond(this.person)) {
          filtered.push(rollcall);
        }
      }
    }
    this.logger.info(this, "filterRollcalls", this.filter, "Rollcalls", rollcalls.length, "Filtered", filtered.length);
    return filtered;
  }

}
