import { Component, ViewChild, NgZone } from '@angular/core';
import { IonicPage, Select, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController, PopoverController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';
import { PersonSelectPage } from '../../pages/person-select/person-select';
import { SettingsPaymentsPage } from '../../pages/settings-payments/settings-payments';

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
      resolve(this.checkin);
    });
  }

  private cancelEdit(event:any) {
    this.logger.info(this, "cancelEdit");
    this.hideModal({
      canceled: true
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

  private sendCheckin(event:any) {
    if (this.checkin.send_via == null || this.checkin.send_via.length == 0) {
      this.showToast("Please select how the Check-In will be sent");
    }
    else {
      let loading = this.showLoading("Sending...", true);
      this.api.sendCheckin(this.organization, this.checkin)
        .then((checkin:Checkin) => { return this.storage.saveCheckin(this.organization, checkin); })
        .then((saved:boolean) => { return this.api.getOrganization(this.organization); })
        .then((organization:Organization) => { this.organization = organization; return this.storage.setOrganization(organization); })
        .then(() => {
          this.events.publish(EVENT_CREDITS_CHANGED, this.organization.credits, Date.now());
          this.api.getOrganization
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

  private showPopover(event:any) {
    this.logger.info(this, "showPopover", event, this.checkin.send_via);

    if (this.organization.hasFreePlan()) {
      return this.upgradeToPro(event);
    }

    let popover = this.popoverController.create(SendViaComponent,
      { send_via: this.checkin.send_via,
        app_enabled: this.organization.app_enabled,
        email_enabled: this.organization.email_enabled,
        // sms_enabled: this.organization.sms_enabled && this.organization.credits > 0,
        sms_enabled: this.organization.sms_enabled,
        slack_enabled: this.organization.slack_enabled,
        on_changed:(send_via:any) => {
            this.logger.info(this, "sendViaChanged", send_via);
            this.checkin.send_via = send_via;
          }
        },
      { showBackdrop: true,
        enableBackdropDismiss: true });
    popover.present({
      ev: event
    });
  }

  private countRecipients() {
    this.checkin.waiting_count = this.checkin.recipientIds().length;
  }

  private upgradeToPro(event:any) {
    this.logger.info(this, "upgradeToPro");

    if (this.ios) {
      return;
    }

    this.navController.push(SettingsPaymentsPage);
  }

}
