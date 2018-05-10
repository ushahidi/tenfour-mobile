import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiProvider } from '../../providers/api/api';
import { DatabaseProvider } from '../../providers/database/database';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Checkin } from '../../models/checkin';
import { Recipient } from '../../models/recipient';
import { Answer } from '../../models/answer';

@IonicPage()
@Component({
  selector: 'page-checkin-test',
  templateUrl: 'checkin-test.html',
  providers: [ ApiProvider, DatabaseProvider ],
  entryComponents:[ ]
})
export class CheckinTestPage extends BasePage {

  organization:Organization = null;
  person:Person = null;
  checkin:Checkin = null;

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
      protected database:DatabaseProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.person = this.getParameter<Person>("person");
    this.initCheckin();
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.trackPage({
      organization: this.organization.name
    });
  }

  private initCheckin() {
    this.checkin = new Checkin({
      organization_id: this.organization.id,
      user_id: this.person.id,
      user_initials: this.person.initials,
      user_picture: this.person.profile_picture,
      message: "Did you receive this test Check-in?",
      self_test_check_in: true,
      send_via: 'apponly'
    });
    this.checkin.answers = [];
    this.checkin.answers.push(new Answer({
      icon: "icon-check",
      type: "positive",
      color: "#58AC5D",
      answer: "Yes"
    }));
    this.checkin.recipients = [];
    if (this.person) {
      let recipient = new Recipient(this.person);
      recipient.user_id = this.person.id;
      this.checkin.recipients.push(recipient);
    }
  }

  private cancelCheckin(event:any) {
    this.hideModal();
  }

  private sendCheckin(event:any) {
    let loading = this.showLoading("Sending...");
    this.api.sendCheckin(this.organization, this.checkin).then((checkin:Checkin) => {
      let saves = [];
      for (let answer of checkin.answers) {
        saves.push(this.database.saveAnswer(this.organization, checkin, answer));
      }
      for (let recipient of checkin.recipients) {
        saves.push(this.database.saveRecipient(this.organization, checkin, recipient));
      }
      for (let reply of checkin.replies) {
        saves.push(this.database.saveReply(this.organization, checkin, reply));
      }
      saves.push(this.database.saveCheckin(this.organization, checkin));
      Promise.all(saves).then(saved => {
        loading.dismiss();
        this.showToast("Test Check-In sent");
        this.hideModal({ checkin: Checkin });
      });
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Creating Checkin", error);
    });
  }

}
