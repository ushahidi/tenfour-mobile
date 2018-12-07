import { Component, NgZone, ViewChild } from '@angular/core';
import { App, IonicPage, Platform, TextInput, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController, PopoverController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';

import { Checkin } from '../../models/checkin';
import { Answer } from '../../models/answer';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

import { ColorPickerComponent } from '../../components/color-picker/color-picker';

@IonicPage({
  name: 'CheckinAnswersPage',
  segment: 'checkins/answers',
  defaultHistory: ['CheckinSendPage']
})
@Component({
  selector: 'page-checkin-answers',
  templateUrl: 'checkin-answers.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[  ]
})
export class CheckinAnswersPage extends BasePrivatePage {

  checkin:Checkin = null;
  dontAskForResponse:boolean = false;

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
      protected storage:StorageProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.checkin = this.getParameter<Checkin>("checkin");
    this.dontAskForResponse = !this.checkin.answers.length;
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

  private toggleAnswers() {
    if (this.dontAskForResponse) {
      this.removeAnswers();
    } else {
      this.addDefaults();
    }
  }

  private removeAnswers() {
    this.checkin.answers = [];
  }

  private addDefaults() {
    this.checkin.answers = [];
    this.checkin.answers.push(new Answer({
      icon: "icon-exclaim",
      type: "negative",
      color: "#E7C24D",
      answer: "No"
    }));
    this.checkin.answers.push(new Answer({
      icon: "icon-check",
      type: "positive",
      color: "#5BAA61",
      answer: "Yes"
    }));
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

  private done() {
    this.logger.info(this, "done");

    if (this.checkin.hasBlankAnswers()) {
      this.showAlert("Blank Answers", "Answers must have a value.");
    }
    else if (this.checkin.hasDuplicateAnswers()) {
      this.showAlert("Duplicate Answers", "Answers must be unique.");
    }
    else {
      this.hideModal();
    }
  }

}
