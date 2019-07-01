import { Component, NgZone, Input } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';
import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';
import { AlertCheckinEditPage } from '../../pages/alert-checkin-edit/alert-checkin-edit';
import { AlertFeedEntry } from '../../models/alertFeedEntry';
import { AlertAutomaticSetupPage } from '../../pages/alert-automatic-setup/alert-automatic-setup';
import { Checkin } from '../../models/checkin';

@IonicPage({
  name: 'AlertFeedAutomaticPage',
  segment: 'alert-feed-automatic'
})
@Component({
  selector: 'page-alert-feed-automatic',
  templateUrl: 'alert-feed-automatic.html',
  providers: [ ApiProvider, StorageProvider ]   
})
export class AlertFeedAutomaticPage extends BasePrivatePage {

  logo:string = "assets/images/logo-dots.png";
  checkin:Checkin = null;
  feedEntry:AlertFeedEntry = null;
  automatic:boolean = false;
  
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
      protected api:ApiProvider,
      protected storage:StorageProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    let loading = this.showLoading("Loading...");
    this.loadUpdates(true).then((loaded:any) => {
      loading.dismiss();
    });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    if (this.organization) {
      this.analytics.trackPage(this, {
        organization: this.organization.name
      });
    }
  }

  private loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    return new Promise((resolve, reject) => {
      return this.loadOrganization(cache)
      .then(() => { return this.loadUser(cache); })
      .then(() => { return this.loadFeedEntry(cache); })
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

  
  private loadCheckin(cache:boolean=true):Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.feedEntry &&  this.user) {
        this.checkin = new Checkin({
          organization_id: this.organization.id,
          user_id: this.user.id,
          user_initials: this.user.initials,
          user_picture: this.user.profile_picture,
          //in the backend, checkin handler can do its thing and generate the bit.ly
          // for long messages
          message: this.getCheckinMessage()
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
        user_picture: this.user.profile_picture
      });
    }
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


  protected loadFeedEntry(cache:boolean=true):Promise<AlertFeedEntry> {
    return new Promise((resolve, reject) => {
      if (cache && this.feedEntry) {
        resolve(this.feedEntry);
      }
      else if (cache && this.hasParameter("feedEntry")){
        this.feedEntry = this.getParameter<AlertFeedEntry>("feedEntry");
        resolve(this.feedEntry);
      }
      else {
        reject("Feed Not Provided");
      }
    });
  }

  private next(event:any) {
    const next = this.automatic ? AlertAutomaticSetupPage : AlertCheckinEditPage;
    let modal = this.showModal(next, {
      organization: this.organization,
      user: this.user,
      feedEntry: this.feedEntry
    });
    

    modal.onDidDismiss(data => {
      this.logger.info(this, "createCheckin", "Modal", data);
    });
  }
}
