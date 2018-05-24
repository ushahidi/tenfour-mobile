import { Component, NgZone } from '@angular/core';
import { App, IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController, PopoverController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { CheckinSendPage } from '../../pages/checkin-send/checkin-send';

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
export class CheckinEditPage extends BasePage {

  organization:Organization = null;
  user:User = null;
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
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
    let loading = this.showLoading("Loading...");
    this.loadUpdates(false).then((finished:any) => {
      this.logger.info(this, "ionViewDidLoad", "loadUpdates", "Loaded");
      loading.dismiss();
    },
    (error:any) => {
      this.logger.error(this, "ionViewDidLoad", "loadUpdates", error);
      loading.dismiss();
    });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    if (this.organization && this.checkin) {
      this.analytics.trackPage({
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
        this.storage.getUser().then((user:User) => {
          this.user = user;
          resolve(this.user);
        });
      }
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
    if (this.organization.app_enabled) {
      this.checkin.send_via = 'app';
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
    if (this.tablet || this.website) {
      this.showModal(CheckinSendPage, {
        organization: this.organization,
        user: this.user,
        checkin: this.checkin
      });
    }
    else {
      this.showPage(CheckinSendPage, {
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
