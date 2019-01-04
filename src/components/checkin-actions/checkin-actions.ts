import { Component, NgZone, ViewChild, OnInit } from '@angular/core';
import { IonicPage, Button, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { Checkin } from '../../models/checkin';
import { Organization } from '../../models/organization';
import { User } from '../../models/user';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@Component({
  selector: 'checkin-actions-popover',
  templateUrl: 'checkin-actions.html'
})
export class CheckinActionsComponent extends BasePage implements OnInit {

  checkin:Checkin;
  organization:Organization;
  user:User;

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

  ngOnInit() {
    this.checkin = this.getParameter('checkin');
    this.organization = this.getParameter('organization');
    this.user = this.getParameter('user');
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
    let website = `https://${this.organization.subdomain}.tenfour.org/#checkins/${this.checkin.id}`;
    this.logger.info(this, "shareCheckin", subject, message.join(" "), image, website);
    this.showShare(subject, message.join(" "), image, website);
    this.viewController.dismiss();
  }

  private saveAsTemplate() {
    let loading = this.showLoading("Saving...", true);
    let checkin = new Checkin(this.checkin);
    checkin.template = true;
    this.api.updateCheckin(this.organization, checkin)
      .then((checkin:Checkin) => { return this.storage.saveCheckin(this.organization, checkin); })
      .then((saved) => {
        loading.dismiss();
        this.showToast("Check-in saved");
        this.viewController.dismiss(true);
      })
      .catch((error:any) => {
        loading.dismiss();
        this.showToast("Problem saving check-in");
        this.viewController.dismiss();
      });
  }

  private removeAsTemplate() {
    let loading = this.showLoading("Removing...", true);
    let checkin = new Checkin(this.checkin);
    checkin.template = false;
    this.api.updateCheckin(this.organization, checkin)
      .then((checkin:Checkin) => { return this.storage.saveCheckin(this.organization, checkin); })
      .then((saved) => {
        loading.dismiss();
        this.showToast("Removed from saved check-ins");
        this.viewController.dismiss(true);
      })
      .catch((error:any) => {
        loading.dismiss();
        this.showToast("Problem removing check-in");
        this.viewController.dismiss();
      });
  }

}
