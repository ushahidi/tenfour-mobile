import { Component, ViewChild, NgZone } from '@angular/core';
import { IonicPage, Select, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController, PopoverController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';
import { PersonSelectPage } from '../../pages/person-select/person-select';
import { SettingsPaymentsPage } from '../../pages/settings-payments/settings-payments';
import { CheckinAnswersPage } from '../../pages/checkin-answers/checkin-answers';
import { CheckinChannelsPage } from '../../pages/checkin-channels/checkin-channels';

import { SendViaComponent } from '../../components/send-via/send-via';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Checkin } from '../../models/checkin';
import { Recipient } from '../../models/recipient';
import { Group } from '../../models/group';
import { Person } from '../../models/person';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

import { EVENT_CREDITS_CHANGED } from '../../constants/events';

@IonicPage({
  name: 'CheckinSendPage',
  segment: 'checkins/send',
  defaultHistory: ['CheckinListPage']
})
@Component({
  selector: 'page-checkin-send',
  templateUrl: 'checkin-send.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ PersonSelectPage ]
})
export class CheckinSendPage extends BasePrivatePage {

  checkin:Checkin = null;

  @ViewChild('select')
  select:Select;

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
      protected api:ApiProvider,
      protected storage:StorageProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
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
        checkin: this.checkin.message
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

  private loadCheckin(cache:boolean=true):Promise<Checkin> {
    return new Promise((resolve, reject) => {
      this.checkin = this.getParameter<Checkin>("checkin");
      if (this.checkin.send_via == null || this.checkin.send_via.length == 0) {
        if (this.organization && this.organization.hasFreePlan()) {
          this.checkin.send_via = "app";
        }
      }
      resolve(this.checkin);
    });
  }

  private cancelEdit(event:any) {
    this.logger.info(this, "cancelEdit");
    this.hideModal({
      canceled: true
    });
  }

  private editAnswers() {
    this.logger.info(this, "editAnswers");
    let modal = this.showModal(CheckinAnswersPage, {
      checkin: this.checkin
    });
  }

  private editChannels() {
    this.logger.info(this, "editChannels");

    let modal = this.showModal(CheckinChannelsPage, {
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
      people: this.checkin.recipients,
      show_groups: true,
      show_people: true
    });
    modal.onDidDismiss(data => {
      this.logger.info(this, "addPerson", data);
       if (data && data.people) {
         let recipients = [];
         for (let person of data.people) {
           let recipient = new Recipient(person);
           recipient.user_id = person.id;
           recipients.push(recipient);
         }
         this.checkin.recipients = recipients;
       }
       if (data && data.groups) {
         this.checkin.groups = data.groups;
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

  private sendCheckin(event:any) {
    if (this.checkin.send_via == null || this.checkin.send_via.length == 0) {
      this.showToast("Please specify 'Send Via' on how to send the Check-In", 4000);
    }
    else if (this.checkin.recipientIds().length == 0) {
      this.showToast("Please specify 'Send To' for who should receive the Check-In", 4000);
    }
    else if (this.checkin.creditsRequired() > this.organization.credits) {
      this.showBillingAlert();
    }
    else {
      let loading = this.showLoading("Sending...", true);
      this.api.sendCheckin(this.organization, this.checkin)
        .then((checkin:Checkin) => { return this.storage.saveCheckin(this.organization, checkin); })
        .then((saved:boolean) => { return this.api.getOrganization(this.organization); })
        .then((organization:Organization) => { this.organization = organization; return this.storage.setOrganization(organization); })
        .then(() => {
          this.events.publish(EVENT_CREDITS_CHANGED, this.organization.credits, Date.now());
          loading.dismiss();
          let recipients = this.checkin.recipientIds().length;
          if (recipients == 1) {
            this.showToast(`Check-In sent to 1 person`);
          }
          else {
            this.showToast(`Check-In sent to ${recipients} people`);
          }
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
  }

  // private showPopover(event:any) {
  //   this.logger.info(this, "showPopover", event, this.checkin.send_via);
  //   if (this.organization.hasFreePlan()) {
  //     let popover = this.popoverController.create(SendViaComponent, {
  //       send_via: this.checkin.send_via,
  //       app_enabled: this.organization.app_enabled,
  //       email_enabled: false,
  //       sms_enabled: false,
  //       slack_enabled: false,
  //       voice_enabled: false,
  //       on_changed:(send_via:any) => {
  //         this.logger.info(this, "sendViaChanged", send_via);
  //         this.checkin.send_via = send_via;
  //         this.countRecipients();
  //       }
  //     },{
  //       showBackdrop: true,
  //       enableBackdropDismiss: true
  //     });
  //     popover.present({
  //       ev: event
  //     });
  //   }
  //   else {
  //     let popover = this.popoverController.create(SendViaComponent, {
  //       send_via: this.checkin.send_via,
  //       app_enabled: this.organization.app_enabled,
  //       email_enabled: this.organization.email_enabled,
  //       sms_enabled: this.organization.sms_enabled,
  //       slack_enabled: this.organization.slack_enabled,
  //       voice_enabled: this.organization.voice_enabled,
  //       on_changed:(send_via:any) => {
  //         this.logger.info(this, "sendViaChanged", send_via);
  //         this.checkin.send_via = send_via;
  //         this.countRecipients();
  //       }
  //     },{
  //       showBackdrop: true,
  //       enableBackdropDismiss: true
  //     });
  //     popover.present({
  //       ev: event
  //     });
  //   }
  // }

  private countRecipients() {
    this.checkin.waiting_count = this.checkin.recipientIds().length;
    this.checkin.fillRecipientsSendVia();
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

  private notifyOwner() {
    this.logger.info(this, "notifyOwner");
    this.api.notifyPerson(this.organization, 'owner', "The organization has insufficient credits to send a Check-In").then(() => {
      this.showToast("The organization owner has been notified")
    }, (error) => {
      this.showToast(error);
    });
  }

}
