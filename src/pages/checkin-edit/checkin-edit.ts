import { Component, NgZone } from '@angular/core';
import { App, IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController, PopoverController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { CheckinSendPage } from '../../pages/checkin-send/checkin-send';

import { ApiProvider } from '../../providers/api/api';
import { DatabaseProvider } from '../../providers/database/database';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Checkin } from '../../models/checkin';
import { Answer } from '../../models/answer';

import { ColorPickerComponent } from '../../components/color-picker/color-picker';

@IonicPage()
@Component({
  selector: 'page-checkin-edit',
  templateUrl: 'checkin-edit.html',
  providers: [ ApiProvider, DatabaseProvider ],
  entryComponents:[ CheckinSendPage ]
})
export class CheckinEditPage extends BasePage {

  organization:Organization = null;
  person:Person = null;
  checkin:Checkin = null;

  constructor(
      protected appController:App,
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
      protected api:ApiProvider,
      protected database:DatabaseProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
    this.organization = this.getParameter<Organization>("organization");
    this.person = this.getParameter<Person>("person");
    this.checkin = this.getParameter<Checkin>("checkin");
    if (this.checkin == null) {
      if (this.person) {
        this.initCheckin();
      }
      else {
        this.database.getPerson(this.organization, null, true).then((person:Person) => {
          this.person = person;
          this.initCheckin();
        });
      }
    }
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.trackPage({
      checkin: this.checkin.id
    });
  }

  private initCheckin() {
    this.checkin = new Checkin({
      organization_id: this.organization.id,
      user_id: this.person.id,
      user_initials: this.person.initials,
      user_picture: this.person.profile_picture
    });
    if (this.organization.app_enabled) {
      this.checkin.send_via = 'apponly';
    }
    this.addDefaults();
  }

  private cancelEdit(event:any) {
    this.logger.info(this, "cancelEdit");
    this.hideModal({
      canceled: true
    });
  }

  private showNext() {
    if (this.tablet || this.web) {
      this.showModal(CheckinSendPage, {
        organization: this.organization,
        person: this.person,
        checkin: this.checkin
      });
    }
    else {
      this.showPage(CheckinSendPage, {
        organization: this.organization,
        person: this.person,
        checkin: this.checkin
      });
    }
  }

  private addDefaults() {
    this.checkin.answers = [];
    this.checkin.answers.push(new Answer({
      icon: "icon-exclaim",
      type: "negative",
      color: "#E8C440",
      answer: "No"
    }));
    this.checkin.answers.push(new Answer({
      icon: "icon-check",
      type: "positive",
      color: "#58AC5D",
      answer: "Yes"
    }));
  }

  private addAnswer() {
    let colors = [
      "#5BAA61", "#E7C24D", "#BA6A6B", "#2875B1",
      "#DE7E2D", "#B63DC1", "#52BFCD", "#0F7E70",
      "#A28AD9", "#19AEE9", "#0273A3", "#304170",
      "#99238C", "#C7470D", "#793EE8", "#1E9545"];
    let color = colors[this.checkin.answers.length];
    this.checkin.answers.push(new Answer({
      icon: "",
      type: "custom",
      color: color,
      answer: "Maybe"
    }));
  }

  private removeAnswer(answer:Answer) {
    for (let i = 0; i < this.checkin.answers.length; i++) {
      if (this.checkin.answers[i] === answer) {
        this.checkin.answers.splice(i, 1);
        break;
      }
    }
  }

  private removeAnswers() {
    this.checkin.answers = [];
  }

  private changeColor(answer:Answer, event:any) {
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

  private onKeyPress(event:any) {
    if (event.keyCode == 13) {
      this.logger.info(this, "onKeyPress", "Enter");
      this.hideKeyboard();
      return false;
    }
    else {
      return true;
    }
  }

}
