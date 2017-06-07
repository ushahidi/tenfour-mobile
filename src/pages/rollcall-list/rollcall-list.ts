import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Events, Button, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

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
import { Recipient } from '../../models/recipients';

@IonicPage()
@Component({
  selector: 'page-rollcall-list',
  templateUrl: 'rollcall-list.html',
  providers: [ ApiService ],
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
      protected database:DatabaseService,
      protected events:Events) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.events.publish("organization:loaded", this.organization);
    this.loadUpdates(null, true);
  }

  loadUpdates(event:any, cache:boolean=true) {
    this.loading = true;
    Promise.all([
      this.loadPerson(cache),
      this.loadRollCalls(cache)]).then((loaded) =>{
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

  loadPerson(cache:boolean=true):Promise<any> {
    if (cache) {
      return this.database.getPerson(null, true).then((person:Person) => {
        if (person) {
          this.person = person;
        }
        else {
          this.loadPerson(false);
        }
      });
    }
    else {
      return this.api.getPerson(this.organization, "me").then((person:Person) => {
        this.person = person;
      });
    }
  }

  loadRollCalls(cache:boolean=true):Promise<any> {
    if (cache) {
      return this.database.getRollcalls(this.organization).then((rollcalls:Rollcall[]) => {
        if (rollcalls && rollcalls.length > 0) {
          this.organization.rollcalls = rollcalls;
        }
        else {
          this.loadRollCalls(false);
        }
      });
    }
    else {
      return this.api.getRollcalls(this.organization).then(
        (rollcalls:Rollcall[]) => {
          let saves = [];
          for (let rollcall of rollcalls) {
            saves.push(this.database.saveRollcall(this.organization, rollcall));
            for (let answer of rollcall.answers) {
              saves.push(this.database.saveAnswer(rollcall, answer));
            }
            for (let recipient of rollcall.recipients) {
              saves.push(this.database.saveRecipient(rollcall, recipient));
            }
            for (let reply of rollcall.replies) {
              saves.push(this.database.saveReply(rollcall, reply));
            }
          }
          Promise.all(saves).then(saved => {
            this.organization.rollcalls = rollcalls;
          });
        });
    }
  }

  showReplies(event:any, rollcall:Rollcall) {
    this.showPage(ReplyListPage, {
      organization: this.organization,
      rollcall: rollcall })
  }

  sendReply(event:any, rollcall:Rollcall) {
    this.logger.info(this, "sendReply");
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
    this.showModal(RollcallEditPage, {
      organization: this.organization,
      person: this.person });
  }

  showNotifications(event:any) {
    this.showPage(NotificationListPage, {
      organization: this.organization,
      person: this.person });
  }

}
