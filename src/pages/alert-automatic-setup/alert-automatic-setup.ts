import { Component, NgZone, ViewChild } from '@angular/core';
import { App, IonicPage, Platform, TextInput, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController, PopoverController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';
import { CheckinSendPage } from '../../pages/checkin-send/checkin-send';
import { Person } from '../../models/person';
import { Checkin } from '../../models/checkin';
import { Answer } from '../../models/answer';
import { Schedule } from '../../models/schedule';
import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';
import { AlertFeedEntry } from '../../models/alertFeedEntry';
import { Recipient } from '../../models/recipient';
import { PersonSelectPage } from '../../pages/person-select/person-select';
import { CheckinChannelsPage } from '../../pages/checkin-channels/checkin-channels';
import { CheckinAnswersPage } from '../../pages/checkin-answers/checkin-answers';
import { Group } from '../../models/group';
import { SettingsPaymentsPage } from '../../pages/settings-payments/settings-payments';
import { AlertFeed } from '../../models/alertFeed';

@IonicPage({
  name: 'AlertAutomaticSetupPage',
  segment: 'alert-feed/automatic/edit',
  defaultHistory: ['AlertFeedAutomaticPage']
})
@Component({
  selector: 'page-alert-automatic-setup',
  templateUrl: 'alert-automatic-setup.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ CheckinSendPage ]
})
export class AlertAutomaticSetupPage extends BasePrivatePage {

  @ViewChild('message')
  message:TextInput;

  checkin:Checkin = null;
  alertFeed:AlertFeed = null;
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
      .then(() => { return this.loadAlertFeed(true); })
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

  protected loadAlertFeed(cache:boolean=true):Promise<AlertFeed> {
    return new Promise((resolve, reject) => {
      if (cache && this.alertFeed) {
        resolve(this.alertFeed);
      }
      else if (cache && this.hasParameter("alertFeed")){
        this.alertFeed = this.getParameter<AlertFeed>("alertFeed");
        resolve(this.alertFeed);
      }
      else {
        reject("AlertFeed Not Provided");
      }
    });
  }

  private loadCheckin(cache:boolean=true):Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.alertFeed &&  this.user) {
        this.checkin = new Checkin({
          organization_id: this.organization.id,
          user_id: this.user.id,
          user_initials: this.user.initials,
          user_picture: this.user.profile_picture,
          //in the backend, checkin handler can do its thing and generate the bit.ly
          // for long messages
          message: `[template] A message will be created for the feed ${this.alertFeed.id} when an alert comes in to the system.`
        });
        this.initCheckin();
      } else if (this.checkin == null) {
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
    if (!this.checkin) {
      this.checkin = new Checkin({
        organization_id: this.organization.id,
        user_id: this.user.id,
        user_initials: this.user.initials,
        user_picture: this.user.profile_picture,
        message: `[template] A message will be created for the feed ${this.alertFeed.id} when an alert comes in to the system.`
      });
    }
    this.checkin.template = true;

    this.checkin.schedule = new Schedule({
      frequency: "once"
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

  private upgradeToPro(event:any) {
    this.logger.info(this, "upgradeToPro");
    if (this.ios) {
      let alert = this.showAlert("Visit Website", "Please login to the website to upgrade to TenFour Pro.");
      alert.onDidDismiss(data => {
        this.showUrl("https://app.tenfour.org", "_blank");
      });
    }
    else {
      this.showModalOrPage(SettingsPaymentsPage, {
        organization: this.organization,
        user: this.user
      });
    }
  }
  private showBillingAlert() {
    if (this.user.isOwner()) {
      this.showAlert("Not enough credits",
        "Purchase more credits in billing in order to send your message",
        [
          { text: 'Cancel', role: 'cancel' },
          { text: 'Billing', handler: () => { this.upgradeToPro(null); } }
        ]
      );
    } else {
      this.showAlert("Not enough credits",
        "Your organization owner will need to buy more before you can send via SMS",
        [
          { text: 'Cancel', role: 'cancel' },
          { text: 'Notify Owner', handler: () => { this.notifyOwner(); } }
        ]
      );
    }
  }

  private notifyOwner() {
    this.logger.info(this, "notifyOwner");
    this.api.notifyPerson(this.organization, 'owner', "The organization has insufficient credits to send a Check-In").then(() => {
      this.showToast("The organization owner has been notified")
    }, (error) => {
      this.showToast(error);
    });
  }

  // same as createCheckin in checkin-send.ts
  private showNext(event:any) {
    if (this.checkin.send_via == null || this.checkin.send_via.length == 0) {
      this.showToast("Please specify 'Send Via' on how to send the Check-In", 4000);
      return;
    }
    else if (this.checkin.recipientIds().length == 0) {
      this.showToast("Please specify 'Send To' for who should receive the Check-In", 4000);
      return;
    }
    else if (this.checkin.schedule.frequency !== 'once' && this.checkin.schedule.hasExpiresAt() == false) {
      this.showToast("Please specify 'Until' for when the scheduled Check-In should end", 4000);
      return;
    }
    else if (this.checkin.creditsRequired() > this.organization.credits) {
      this.showBillingAlert();
      return;
    }
    let loading = this.showLoading("Saving...", true);

    this.api.createCheckin(this.organization, this.checkin, { feed_id: this.alertFeed.id })
      .then((checkin:Checkin) => { return this.storage.saveCheckin(this.organization, checkin); })
      .then(() => {
        loading.dismiss();
        this.showToast(`Check-In saved`);
        let firstViewController = this.navController.first();
        this.navController.popToRoot({ animate: false }).then(() => {
          firstViewController.dismiss({ checkin: Checkin });
        });
      })
      .catch((error:any) => {
        loading.dismiss();
        this.showAlert("Problem Creating Check-In", error);
      });
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

  private editAnswers() {
    this.logger.info(this, "editAnswers");
    this.showModal(CheckinAnswersPage, {
      checkin: this.checkin
    });
  }

  private editChannels() {
    this.logger.info(this, "editChannels");
    this.showModal(CheckinChannelsPage, {
      checkin: this.checkin,
      organization: this.organization,
      user: this.user
    });
  }

  private addPerson() {
    this.logger.info(this, "addPerson");
    let modal = this.showModal(PersonSelectPage, {
      organization: this.organization,
      user: this.user,
      groups: this.checkin.groups,
      people: this.checkin.users,
      show_groups: true,
      show_people: true,
      show_everyone: true
    });
    modal.onDidDismiss(data => {
      this.logger.info(this, "addPerson", data);
       if (data && data.people) {
         this.checkin.users = data.people;
         this.checkin.user_ids = this.checkin.users.map((user) => { return user.id; }).join(',');
       }
       if (data && data.groups) {
         this.checkin.groups = data.groups;
         this.checkin.group_ids = this.checkin.groups.map((group) => { return group.id; }).join(',');
       }
       if (data && data.everyone) {
         this.checkin.everyone = true;
       }
       this.countRecipients();
     });
  }

  private removeRecipient(recipient:Recipient) {
    this.logger.info(this, "removeRecipient", recipient);
    for (let i = 0; i < this.checkin.recipients.length; i++) {
      if (this.checkin.recipients[i] === recipient) {
        this.checkin.recipients.splice(i, 1);
        break;
      }
    }
    this.countRecipients();
  }

  private removeGroup(group:Group) {
    this.logger.info(this, "removeGroup", group);
    for (let i = 0; i < this.checkin.groups.length; i++) {
      if (this.checkin.groups[i] === group) {
        this.checkin.groups.splice(i, 1);
        break;
      }
    }
    this.countRecipients();
  }

  private countRecipients() {
    this.checkin.waiting_count = this.checkin.recipientIds().length;
    this.checkin.fillRecipientsSendVia();
  }

}
