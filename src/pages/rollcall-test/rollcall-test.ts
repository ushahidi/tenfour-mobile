import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Rollcall } from '../../models/rollcall';
import { Recipient } from '../../models/recipient';
import { Answer } from '../../models/answer';

@IonicPage()
@Component({
  selector: 'page-rollcall-test',
  templateUrl: 'rollcall-test.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[ ]
})
export class RollcallTestPage extends BasePage {

  organization:Organization = null;
  person:Person = null;
  rollcall:Rollcall = null;

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
    this.person = this.getParameter<Person>("person");
    this.initRollcall();
  }

  initRollcall() {
    this.rollcall = new Rollcall({
      organization_id: this.organization.id,
      user_id: this.person.id,
      user_initials: this.person.initials,
      user_picture: this.person.profile_picture,
      message: "Did you receive this test RollCall?",
      self_test_roll_call: true,
      send_via: 'apponly'
    });
    this.rollcall.answers = [];
    this.rollcall.answers.push(new Answer({
      icon: "icon-check",
      type: "positive",
      color: "#58AC5D",
      answer: "Yes"
    }));
    this.rollcall.recipients = [];
    if (this.person) {
      let recipient = new Recipient(this.person);
      recipient.user_id = this.person.id;
      this.rollcall.recipients.push(recipient);
    }
  }

  cancelRollcall(event:any) {
    this.hideModal();
  }

  sendRollcall(event:any) {
    let loading = this.showLoading("Sending...");
    this.api.postRollcall(this.organization, this.rollcall).then((rollcall:Rollcall) => {
      let saves = [];
      for (let answer of rollcall.answers) {
        saves.push(this.database.saveAnswer(rollcall, answer));
      }
      for (let recipient of rollcall.recipients) {
        saves.push(this.database.saveRecipient(rollcall, recipient));
      }
      for (let reply of rollcall.replies) {
        saves.push(this.database.saveReply(rollcall, reply));
      }
      saves.push(this.database.saveRollcall(this.organization, rollcall));
      Promise.all(saves).then(saved => {
        loading.dismiss();
        this.showToast("RollCall test sent");
        this.hideModal({ rollcall: Rollcall });
      });
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Creating Rollcall", error);
    });
  }

}
