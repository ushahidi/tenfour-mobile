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

@IonicPage()
@Component({
  selector: 'page-rollcall-list',
  templateUrl: 'rollcall-list.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[ RollcallEditPage, ReplyListPage, ReplySendPage, NotificationListPage ]
})
export class RollcallListPage extends BasePage {

  @ViewChild('notifications')
  notifications:Button;

  @ViewChild('create')
  create:Button;

  organization:Organization = null;
  person:Person = null;
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
      protected api:ApiService,
      protected database:DatabaseService) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.loadUpdates(null, true);
  }

  loadUpdates(event:any, cache:boolean=true) {
    this.loading = true;
    Promise.all([
      this.loadPerson(cache),
      this.loadRollCalls(cache)]).then(
      (loaded:any) =>{
        this.logger.info(this, "loadUpdates", "Done");
        if (event) {
          event.complete();
        }
        this.loading = false;
      },
      (error:any) => {
        if (event) {
          event.complete();
        }
        this.loading = false;
        this.showToast(error);
      });
  }

  loadPerson(cache:boolean=true):Promise<Person> {
    return new Promise((resolve, reject) => {
      if (cache) {
        this.database.getPerson(null, true).then(
          (person:Person) => {
            this.logger.info(this, "loadPerson", "Database");
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

  loadRollCalls(cache:boolean=true):Promise<Rollcall[]> {
    return new Promise((resolve, reject) => {
      if (cache) {
        return this.database.getRollcalls(this.organization).then((rollcalls:Rollcall[]) => {
          if (rollcalls && rollcalls.length > 0) {
            this.organization.rollcalls = rollcalls;
            resolve(rollcalls);
          }
          else {
            this.loadRollCalls(false).then((rollcalls:Rollcall[]) => {
              this.organization.rollcalls = rollcalls;
              resolve(rollcalls);
            },
            (error:any) => {
              this.organization.rollcalls = [];
              reject(error);
            });
          }
        });
      }
      else {
        return this.api.getRollcalls(this.organization).then(
          (rollcalls:Rollcall[]) => {
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
                this.organization.rollcalls = rollcalls;
                resolve(rollcalls);
              });
            }
            else {
              this.organization.rollcalls = [];
              resolve([]);
            }
          },
          (error:any) => {
            this.organization.rollcalls = [];
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
        this.loadRollCalls(true);
      }
   });
  }

  createRollcall(event:any) {
    let modal = this.showModal(RollcallEditPage, {
      organization: this.organization,
      person: this.person });
    modal.onDidDismiss(data => {
      if (data) {
        this.loadRollCalls(true);
      }
    });
  }

  showNotifications(event:any) {
    this.showPage(NotificationListPage, {
      organization: this.organization,
      person: this.person });
  }

}
