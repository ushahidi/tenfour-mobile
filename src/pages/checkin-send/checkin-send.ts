import { Component, ViewChild, NgZone } from '@angular/core';
import { IonicPage, Select, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController, PopoverController } from 'ionic-angular';

import * as moment from 'moment';

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
import { Schedule } from '../../models/schedule';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

import { EVENT_CREDITS_CHANGED } from '../../constants/events';
import { TIME_HOURS, TIME_DAYS, TIME_WEEKS, TIME_MONTHS, TIME_YEARS } from '../../constants/times';

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

  today:string = null;
  future:string = null;
  frequencies:any = {
    'once': null,
    'hourly': TIME_HOURS,
    'daily': TIME_DAYS,
    'weekly': TIME_WEEKS,
    'monthly': TIME_MONTHS,
    'yearly': TIME_YEARS
  }

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
    let loading = this.showLoading("Loading...", true);
    this.loadUpdates(false).then((loaded:any) => {
      loading.dismiss();
    });
    this.today = moment().local().format('YYYY-MM-DD');
    this.future = moment().add(2, 'years').format('YYYY-MM-DD');
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
    return new Promise((resolve, reject) => {
      return this.loadOrganization(cache)
      .then(() => { return this.loadUser(cache); })
      .then(() => { return this.loadCheckin(cache); })
      .then(() => { return this.loadEveryone(cache); })
      .then(() => { return this.loadContactsForCheckin(cache); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Loaded");
        this.countRecipients();
        if (event) {
          event.complete();
        }
        resolve(true);
      })
      .catch((error) => {
        this.logger.error(this, "loadUpdates", "Failed", error);
        if (event) {
          event.complete();
        }
        this.showToast(error);
        resolve(false);
      });
    });
  }

  private loadCheckin(cache:boolean=true):Promise<Checkin> {
    return new Promise((resolve, reject) => {
      this.checkin = this.getParameter<Checkin>("checkin");
      if (this.organization && this.organization.hasFreePlan()) {
        this.checkin.send_via = "app";
      }
      if (this.checkin.schedule == null) {
        this.checkin.schedule = new Schedule({
          frequency: "once"
        });
      }
      resolve(this.checkin);
    });
  }

  private loadEveryone(cache:boolean=true):Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.checkin.everyone) {
        this.promiseFallback(cache,
          this.storage.getPeople(this.organization),
          this.api.getPeople(this.organization)).then((people:Person[]) => {
            this.checkin.users = people;
            resolve(true);
          },
          (error:any) => {
            reject(null);
          });
      } else {
        resolve(false);
      }
    });
  }

  private loadContactsForCheckin(cache:boolean=true):Promise<any> {
    return new Promise((resolve, reject) => {
      let promises = [];
      this.checkin.users.forEach((person:Person) => {
        if (!person.contacts || !person.contacts.length) {
          promises.push(this.loadContactsForPerson(cache, person));
        }
      });
      this.checkin.groups.forEach((group:Group) => {
        group.members.forEach((person:Person) => {
          if (!person.contacts || !person.contacts.length) {
            promises.push(this.loadContactsForPerson(cache, person));
          }
        });
      });

      Promise.all(promises).then(resolve,reject);
    });
  }

  private loadContactsForPerson(cache:boolean=true, person:Person):Promise<Person> {
    return new Promise((resolve, reject) => {
      this.promiseFallback(cache,
        this.storage.getPerson(this.organization, person.id),
        this.api.getPerson(this.organization, person.id)).then((person2:Person) => {
          person.contacts = person2.contacts;
          resolve(person);
        },
        (error:any) => {
          reject(null);
        });
      });
  }

  private cancelEdit(event:any) {
    this.logger.info(this, "cancelEdit");
    if (this.checkin.template) {
        let buttons = [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              this.logger.info(this, "save", "Cancelled");
            }
          },
          {
            text: 'Discard',
            handler: () => {
              this.hideModal({
                canceled: true
              });
            }
          },
          {
            text: 'Save & Exit',
            handler: () => {
              this.createCheckin(event);
            }
          }
        ];
        this.showConfirm("Do you want to save this check-in?",
          "You can save this check-in to re-use later.", buttons);
    } else {
      this.hideModal({
        canceled: true
      });
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

  private createCheckin(event:any) {
    let loading = this.showLoading("Saving...", true);
    this.api.createCheckin(this.organization, this.checkin)
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

  private sendCheckin(event:any) {
    if (this.checkin.send_via == null || this.checkin.send_via.length == 0) {
      this.showToast("Please specify 'Send Via' on how to send the Check-In", 4000);
    }
    else if (this.checkin.recipientIds().length == 0) {
      this.showToast("Please specify 'Send To' for who should receive the Check-In", 4000);
    }
    else if (this.checkin.schedule.frequency !== 'once' && this.checkin.schedule.hasExpiresAt() == false) {
      this.showToast("Please specify 'Until' for when the scheduled Check-In should end", 4000);
    }
    else if (this.checkin.schedule.hasStartsAt() && this.checkin.schedule.isStartsAtInFuture() == false) {
      this.showToast("Please specify 'When' to be a time in the future", 4000);
    }
    else if (this.checkin.schedule.hasExpiresAt() && this.checkin.schedule.isExpiresAtInFuture() == false) {
      this.showToast("Please specify 'Until' to be a time in the future", 4000);
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

  private datesChanged(event:any) {
    this.logger.info(this, "datesChanged", event);
    if (this.checkin.schedule.hasStartsAt() && this.checkin.schedule.hasExpiresAt()) {
      let milliseconds = this.frequencies[this.checkin.schedule.frequency];
      if (milliseconds) {
        let starts_at = this.checkin.schedule.startsAt().valueOf();
        let expires_at = this.checkin.schedule.expiresAt().valueOf();
        let duration = Math.abs((expires_at - starts_at));
        this.checkin.schedule.remaining_count = Math.round(duration / milliseconds);
      }
      else {
        this.checkin.schedule.remaining_count = null;
      }
    }
    else {
      this.checkin.schedule.remaining_count = null;
    }
  }

  private countsChanged(event:any) {
    this.logger.info(this, "countsChanged", event);
    if (this.checkin.schedule.hasStartsAt() == false) {
      let now = new Date();
      let local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      this.checkin.schedule.starts_at = new Date(local).toISOString();
    }
    let milliseconds = this.frequencies[this.checkin.schedule.frequency];
    if (milliseconds) {
      let starts_at = this.checkin.schedule.startsAt();
      let expires_at = starts_at.getTime() + (this.checkin.schedule.remaining_count * milliseconds);
      this.checkin.schedule.expires_at = new Date(expires_at).toISOString();
    }
    else {
      this.checkin.schedule.expires_at = null;
    }
  }

}
