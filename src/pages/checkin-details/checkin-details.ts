import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Events, Button, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { CheckinRespondPage } from '../../pages/checkin-respond/checkin-respond';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Checkin } from '../../models/checkin';
import { Person } from '../../models/person';
import { Reply } from '../../models/reply';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';
import { DatabaseProvider } from '../../providers/database/database';

@IonicPage({
  name: 'CheckinDetailsPage',
  segment: 'checkins/:checkin_id',
  defaultHistory: ['CheckinListPage']
})
@Component({
  selector: 'page-checkin-details',
  templateUrl: 'checkin-details.html',
  providers: [ ApiProvider, StorageProvider, DatabaseProvider ],
  entryComponents:[ CheckinRespondPage ]
})
export class CheckinDetailsPage extends BasePage {

  @ViewChild('notifications')
  notifications:Button;

  @ViewChild('create')
  create:Button;

  organization:Organization = null;
  user:User = null;

  checkin:Checkin = null;

  modal:boolean = false;

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
      protected database:DatabaseProvider,
      protected storage:StorageProvider,
      protected events:Events) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.checkin = this.getParameter<Checkin>("checkin");
    this.modal = this.getParameter<boolean>("modal");
    this.loadUpdates(true);
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    if (this.organization && this.user) {
      this.trackPage({
        organization: this.organization.name,
        checkin: this.checkin.message
      });
    }
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    this.loading = true;
    return Promise.resolve()
      .then(() => { return this.loadOrganization(cache); })
      .then(() => { return this.loadUser(cache); })
      .then(() => { return this.loadReplies(cache); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Done");
        if (event) {
          event.complete();
        }
        this.loading = false;
      })
      .catch((error) => {
        this.logger.info(this, "loadUpdates", "Failed", error);
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
        this.storage.getUser().then((person:Person) => {
          this.user = person;
          resolve(this.user);
        });
      }
    });
  }

  private loadReplies(cache:boolean=true):Promise<any> {
    return new Promise((resolve, reject) => {
      if (cache) {
        this.database.getReplies(this.organization, this.checkin).then((replies:Reply[]) => {
          this.checkin.replies = replies;
          resolve(replies);
        },
        (error:any) => {
          this.loadReplies(false).then((replies:Reply[]) => {
            this.checkin.replies = replies;
            resolve(replies);
          },
          (error:any) => {
            reject(error);
          });
        });
      }
      else {
        this.api.getCheckin(this.organization, this.checkin.id).then((checkin:Checkin) => {
          for (let reply of checkin.replies) {
            if (this.user && this.user.id == reply.user_id) {
              checkin.replied = true;
            }
          }
          if (this.mobile) {
            this.database.saveCheckin(this.organization, checkin).then((saved:boolean) => {
              this.checkin = checkin;
              resolve(checkin.replies);
            });
          }
          else {
            this.checkin = checkin;
            resolve(checkin.replies);
          }
        },
        (error:any) => {
          reject(error);
        });
      }
    });
  }

  private respondCheckin(event:any) {
    this.logger.info(this, "respondCheckin");
    let modal = this.showModal(CheckinRespondPage, {
      organization: this.organization,
      checkins: [this.checkin],
      checkin: this.checkin
    });
    modal.onDidDismiss(data => {
      this.logger.info(this, "respondCheckin", "Modal", data);
      if (data) {
        if (data.canceled) {
          this.logger.info(this, "respondCheckin", "Modal", "Canceled");
        }
        else {
          let loading = this.showLoading("Refreshing...");
          this.loadReplies(false).then((replies) => {
            loading.dismiss();
          });
        }
      }
   });
  }

  private editReply(reply:Reply, event:any) {
    this.logger.info(this, "editReply");
    if (reply.user_id == this.user.id) {
      let modal = this.showModal(CheckinRespondPage, {
        organization: this.organization,
        checkins: [this.checkin],
        checkin: this.checkin,
        reply: reply
      });
      modal.onDidDismiss(data => {
        this.logger.info(this, "editReply", "Modal", data);
        if (data) {
          if (data.canceled) {
            this.logger.info(this, "editReply", "Modal", "Canceled");
          }
          else {
            let loading = this.showLoading("Refreshing...");
            this.loadReplies(false).then((replies) => {
              loading.dismiss();
            });
          }
        }
     });
    }
  }

  private resendCheckin(event:any) {
    this.logger.info(this, "resendCheckin");
    let loading = this.showLoading("Resending...");
    this.api.resendCheckin(this.organization, this.checkin).then((checkin:Checkin) => {
      loading.dismiss();
      this.showToast(`Check-In ${this.checkin.message} resent`);
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Resending Check-In", error);
    });
  }

  private closeModal(event:any) {
    this.hideModal({});
  }

  private shareCheckin(event:any) {
    let subject = this.checkin.message;
    let message = [];
    for (let answer of this.checkin.answers) {
      if (answer.replies > 0) {
        let replies = [];
        for (let reply of this.checkin.answerReplies(answer)) {
          replies.push(reply.user_name);
        }
        message.push(`${answer.answer} - ${replies.join(", ")}`);
      }
    }
    if (this.checkin.replies.length < this.checkin.recipients.length) {
      let pending = [];
      for (let recipient of this.checkin.recipientsPending()) {
        pending.push(recipient.name);
      }
      message.push(`No Response - ${pending.join(", ")}`);
    }
    let image = this.checkin.user_picture;
    let website = `https://${this.organization.subdomain}.tenfour.org/checkins/${this.checkin.id}`;
    this.logger.info(this, "shareCheckin", subject, message.join(" "), image, website);
    this.showShare(subject, message.join(" "), image, website);
  }

}
