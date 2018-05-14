import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { Badge } from '@ionic-native/badge';

import { BasePage } from '../../pages/base-page/base-page';
import { CheckinEditPage } from '../../pages/checkin-edit/checkin-edit';
import { CheckinDetailsPage } from '../../pages/checkin-details/checkin-details';
import { CheckinRespondPage } from '../../pages/checkin-respond/checkin-respond';
import { NotificationListPage } from '../../pages/notification-list/notification-list';

import { ApiProvider } from '../../providers/api/api';
import { DatabaseProvider } from '../../providers/database/database';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Checkin } from '../../models/checkin';
import { Notification } from '../../models/notification';

@IonicPage({
  segment: 'checkins'
})
@Component({
  selector: 'page-checkin-list',
  templateUrl: 'checkin-list.html',
  providers: [ ApiProvider, DatabaseProvider ],
  entryComponents:[ CheckinEditPage, CheckinDetailsPage, CheckinRespondPage, NotificationListPage ]
})
export class CheckinListPage extends BasePage {

  LARGE_WIDTH:number = 992;

  filter:string = "all";
  organization:Organization = null;
  checkins:Checkin[] = [];
  selected:Checkin = null;
  notifications:Notification[] = [];
  person:Person = null;
  loading:boolean = false;
  notify:boolean = false;
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
      protected badge:Badge,
      protected api:ApiProvider,
      protected database:DatabaseProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
    this.organization = this.getParameter<Organization>("organization");
    this.person = this.getParameter<Person>("person");
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
    if (this.loading == false) {
      this.loadNotifications(true);
    }
    this.selected = null;
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
      .then(() => { return this.loadCheckins(cache); })
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

  private loadPerson(cache:boolean=true):Promise<Person> {
    return new Promise((resolve, reject) => {
      if (cache && this.mobile) {
        this.database.getPerson(this.organization, null, true).then((person:Person) => {
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
          if (this.mobile) {
            this.database.savePerson(this.organization, person).then(saved => {
              this.person = person;
              resolve(person);
            },
            (error:any) => {
              this.person = person;
              resolve(person);
            });
          }
          else {
            this.person = person;
            resolve(person);
          }
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
          if (this.mobile) {
            this.database.saveOrganization(this.organization).then(saved => {
              this.organization = organization;
              resolve(organization);
            },
            (error:any) => {
              this.organization = organization;
              resolve(organization);
            });
          }
          else {
            this.organization = organization;
            resolve(organization);
          }
        },
        (error:any) => {
          reject(error);
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
              if (this.person && this.person.id == reply.user_id) {
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

  private loadNotifications(cache:boolean=true):Promise<any> {
    this.notify = false;
    return new Promise((resolve, reject) => {
      let limit = 10;
      let offset = 0;
      if (cache && this.mobile) {
        this.database.getNotifications(this.organization, limit, offset).then((notifications:Notification[]) => {
          this.notifications = notifications;
          for (let notification of notifications) {
            if (notification.viewed_at == null) {
              this.notify = true;
            }
          }
          resolve(notifications);
        },
        (error:any) => {
          resolve([]);
        });
      }
      else {
        this.api.getNotifications(this.organization).then((notifications:Notification[]) => {
          if (this.mobile) {
            this.database.saveNotifications(this.organization, notifications).then((saved:boolean) => {
              this.database.getNotifications(this.organization, limit, offset).then((_notifications:Notification[]) => {
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
          }
          else {
            this.notifications = notifications;
            resolve(notifications);
          }
        },
        (error:any) => {
          reject(error);
        });
      }
    });
  }

  private loadWaitingResponse() {
    if (this.mobile) {
      this.database.getCheckinsWaiting(this.organization, 25).then((waiting:Checkin[]) => {
        this.logger.info(this, "loadWaitingResponse", waiting.length);
        let checkins = [];
        for (let checkin of waiting) {
          if (checkin.canRespond(this.person)) {
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
      }
      else {
        resolve(0);
      }
    });
  }

  private showReplies(checkin:Checkin, event:any=null) {
    this.showPage(CheckinDetailsPage, {
      organization: this.organization,
      person: this.person,
      checkin: checkin,
      checkin_id: checkin.id
    });
  }

  private sendReply(checkin:Checkin, event:any=null) {
    let modal = this.showModal(CheckinRespondPage, {
      organization: this.organization,
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
      person: this.person
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

  private showNotifications(event:any) {
    this.showPage(NotificationListPage, {
      organization: this.organization,
      person: this.person,
      notifications: this.notifications
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
        if (checkin.canRespond(this.person)) {
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
