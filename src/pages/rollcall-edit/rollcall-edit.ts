import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { RollcallSendPage } from '../../pages/rollcall-send/rollcall-send';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Rollcall } from '../../models/rollcall';
import { Answer } from '../../models/answer';

@IonicPage()
@Component({
  selector: 'page-rollcall-edit',
  templateUrl: 'rollcall-edit.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[ RollcallSendPage ]
})
export class RollcallEditPage extends BasePage {

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

  ionViewDidLoad() {
    super.ionViewDidLoad();
    this.organization = this.getParameter<Organization>("organization");
    this.person = this.getParameter<Person>("person");
    this.rollcall = this.getParameter<Rollcall>("rollcall");
    if (this.rollcall == null) {
      if (this.person) {
        this.initRollcall();
      }
      else {
        this.database.getPerson(null, true).then((person:Person) => {
          this.person = person;
          this.initRollcall();
        });
      }
    }
  }

  initRollcall() {
    this.rollcall = new Rollcall({
      organization_id: this.organization.id,
      user_id: this.person.id,
      user_initials: this.person.initials,
      user_picture: this.person.profile_picture
      // send_via: 'apponly'
    });
    this.addDefaults();
  }

  cancelEdit(event) {
    this.hideModal();
  }

  showNext() {
    this.showPage(RollcallSendPage, {
      organization: this.organization,
      person: this.person,
      rollcall: this.rollcall });
  }

  addDefaults() {
    this.rollcall.answers = [];
    this.rollcall.answers.push(new Answer({
      icon: "icon-exclaim",
      type: "negative",
      color: "#E8C440",
      answer: "No"
    }));
    this.rollcall.answers.push(new Answer({
      icon: "icon-check",
      type: "positive",
      color: "#58AC5D",
      answer: "Yes"
    }));
  }

  addCustom() {
    let colors = [
      "#E8C440", "#58AC5D", "#B835C4", "#577BAB",
      "#A28AD9", "#19AEE9", "#0273A3", "#4B9183",
      "#D3BAEB", "#304170", "#99238C", "#1DB7ED",
      "#793EE8", "#8FDEDC", "#507BBE", "#0F7E70"];
    let color = colors[this.rollcall.answers.length];
    this.rollcall.answers.push(new Answer({
      icon: "",
      type: "custom",
      color: color,
      answer: "Maybe"
    }));
  }

  removeAnswer(answer:Answer) {
    for (let i = 0; i < this.rollcall.answers.length; i++) {
      if (this.rollcall.answers[i] === answer) {
        this.rollcall.answers.splice(i, 1);
        break;
      }
    }
  }

  removeAnswers() {
    this.rollcall.answers = [];
  }

  changeColor(answer:Answer) {
    this.logger.info(this, "changeColor", answer);
  }
  
}
