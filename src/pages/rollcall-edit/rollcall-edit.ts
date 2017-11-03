import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController, PopoverController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { RollcallSendPage } from '../../pages/rollcall-send/rollcall-send';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Rollcall } from '../../models/rollcall';
import { Answer } from '../../models/answer';

import { ColorPickerComponent } from '../../components/color-picker/color-picker';

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
      protected popoverController:PopoverController,
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
    });
    if (this.organization.app_enabled) {
      this.rollcall.send_via = 'apponly';
    }
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

  addAnswer() {
    let colors = [
      "#5BAA61", "#E7C24D", "#BA6A6B", "#2875B1",
      "#DE7E2D", "#B63DC1", "#52BFCD", "#0F7E70",
      "#A28AD9", "#19AEE9", "#0273A3", "#304170",
      "#99238C", "#C7470D", "#793EE8", "#1E9545"];
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

  changeColor(answer:Answer, event:any) {
    this.logger.info(this, "changeColor", answer);
    let popover = this.popoverController.create(ColorPickerComponent,
      { color: answer.color,
        on_changed:(color:any) => {
            this.logger.info(this, "changeColor", color);
            answer.color = color;
          }
        },
      { showBackdrop: true,
        enableBackdropDismiss: true });
    popover.present({
      ev: event
    });
  }

}
