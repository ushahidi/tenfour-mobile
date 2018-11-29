import { Component, NgZone, ViewChild } from '@angular/core';
import { App, IonicPage, Platform, TextInput, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController, PopoverController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';
import { CheckinSendPage } from '../../pages/checkin-send/checkin-send';
import { CheckinTemplatesPage } from '../../pages/checkin-templates/checkin-templates';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';
import { Checkin } from '../../models/checkin';
import { Answer } from '../../models/answer';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

import { ColorPickerComponent } from '../../components/color-picker/color-picker';

@IonicPage({
  name: 'CheckinEditPage',
  segment: 'checkins/edit',
  defaultHistory: ['CheckinListPage']
})
@Component({
  selector: 'page-checkin-edit',
  templateUrl: 'checkin-edit.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ CheckinSendPage ]
})
export class CheckinEditPage extends BasePrivatePage {

  @ViewChild('message')
  message:TextInput;

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
      protected storage:StorageProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
    let loading = this.showLoading("Loading...");
    this.loadUpdates(false).then((loaded:any) => {
      loading.dismiss();
    });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    if (this.organization && this.checkin) {
      this.analytics.trackPage(this, {
        organization: this.organization.name,
        checkin: this.checkin.id
      });
    }
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    return Promise.resolve()
      .then(() => { return this.loadOrganization(cache); })
      .then(() => { return this.loadUser(cache); })
      .then(() => { return this.loadCheckin(cache); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Loaded");
        if (event) {
          event.complete();
        }
      })
      .catch((error) => {
        this.logger.error(this, "loadUpdates", "Failed", error);
        if (event) {
          event.complete();
        }
        this.showToast(error);
      });
  }

  private loadCheckin(cache:boolean=true):Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.checkin == null) {
        if (this.user) {
          this.initCheckin();
        }
        else if (this.mobile) {
          this.storage.getPerson(this.organization, null, true).then((person:Person) => {
            this.user = person;
            this.initCheckin();
          });
        }
      }
      resolve(true);
    });
  }

  private initCheckin() {
    this.checkin = new Checkin({
      organization_id: this.organization.id,
      user_id: this.user.id,
      user_initials: this.user.initials,
      user_picture: this.user.profile_picture
    });
    let send_via = [];

    if (this.organization.app_enabled) {
      send_via.push('app');
    }

    if (this.organization.hasProPlan() && this.organization.sms_enabled) {
      send_via.push('sms');
    }

    if (this.organization.hasProPlan() && this.organization.email_enabled) {
      send_via.push('email');
    }

    if (this.organization.hasProPlan() && this.organization.slack_enabled) {
      send_via.push('slack');
    }

    if (this.organization.hasProPlan() && this.organization.voice_enabled) {
      send_via.push('voice');
    }

    this.checkin.send_via = send_via.join(',');
    this.addDefaults();
  }

  private cancelEdit(event:any) {
    this.logger.info(this, "cancelEdit");
    this.hideModal({
      canceled: true
    });
  }

  private showNext() {
    if (this.message.value.length == 0) {
      this.showToast("Please enter your question or message");
      setTimeout(() => {
        this.message.setFocus();
      }, 500);
    }
    // else if (this.checkin.hasBlankAnswers()) {
    //   this.showAlert("Blank Answers", "Answers must have a value.");
    // }
    // else if (this.checkin.hasDuplicateAnswers()) {
    //   this.showAlert("Duplicate Answers", "Answers must be unique.");
    // }
    else {
      this.showModal(CheckinSendPage, {
        organization: this.organization,
        user: this.user,
        checkin: this.checkin
      });
    }
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

  // private addAnswer() {
  //   let colors = [
  //     "#5BAA61", "#E7C24D", "#BA6A6B", "#2875B1",
  //     "#DE7E2D", "#B63DC1", "#52BFCD", "#0F7E70",
  //     "#A28AD9", "#19AEE9", "#0273A3", "#304170",
  //     "#99238C", "#C7470D", "#793EE8", "#1E9545"];
  //   let color = colors[this.checkin.answers.length];
  //   this.checkin.answers.push(new Answer({
  //     icon: "",
  //     type: "custom",
  //     color: color,
  //     answer: "Maybe"
  //   }));
  // }
  //
  // private removeAnswer(answer:Answer) {
  //   for (let i = 0; i < this.checkin.answers.length; i++) {
  //     if (this.checkin.answers[i] === answer) {
  //       this.checkin.answers.splice(i, 1);
  //       break;
  //     }
  //   }
  // }
  //
  // private removeAnswers() {
  //   this.checkin.answers = [];
  // }
  //
  // private changeColor(answer:Answer, event:any) {
  //   this.logger.info(this, "changeColor", answer);
  //   let popover = this.popoverController.create(ColorPickerComponent,
  //     { color: answer.color,
  //       on_changed:(color:any) => {
  //           this.logger.info(this, "changeColor", color);
  //           answer.color = color;
  //         }
  //       },
  //     { showBackdrop: true,
  //       enableBackdropDismiss: true });
  //   popover.present({
  //     ev: event
  //   });
  // }

  private showTemplates(event:any) {
    this.logger.info(this, "showTemplates");
    this.showModal(CheckinTemplatesPage, {
      organization: this.organization
    });
  }

  private onKeyPress(event:any) {
    if (this.isKeyReturn(event)) {
      this.logger.info(this, "onKeyPress", "Enter");
      this.hideKeyboard();
      return false;
    }
    else {
      return true;
    }
  }

}
