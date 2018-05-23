import { Component, ViewChild, NgZone } from '@angular/core';
import { IonicPage, Select, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController, PopoverController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { PersonSelectPage } from '../../pages/person-select/person-select';

import { SendViaComponent } from '../../components/send-via/send-via';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Checkin } from '../../models/checkin';
import { Recipient } from '../../models/recipient';
import { Group } from '../../models/group';
import { Person } from '../../models/person';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

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
export class CheckinSendPage extends BasePage {

  organization:Organization = null;
  user:User = null;
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
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
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
      this.trackPage({
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

  private loadCheckin(cache:boolean=true):Promise<Checkin> {
    return new Promise((resolve, reject) => {
      this.checkin = this.getParameter<Checkin>("checkin");
      resolve(this.checkin );
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
      show_groups: true
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
  }

  private removeGroup(group:Group) {
    this.logger.info(this, "removeGroup", group);
    for (let i = 0; i < this.checkin.groups.length; i++) {
      if (this.checkin.groups[i] === group) {
        this.checkin.groups.splice(i, 1);
        break;
      }
    }
  }

  private sendCheckin(event:any) {
    if (this.checkin.send_via == null || this.checkin.send_via.length == 0) {
      this.showToast("Please select how the Check-In will be sent");
    }
    else {
      let loading = this.showLoading("Sending...");
      this.api.sendCheckin(this.organization, this.checkin).then((checkin:Checkin) => {
        if (this.mobile) {
          this.storage.saveCheckin(this.organization, checkin).then((saved:boolean) => {
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
          });
        }
        else {
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
        }
      },
      (error:any) => {
        loading.dismiss();
        this.showAlert("Problem Creating Check-In", error);
      });
    }
  }

  private onAppOnly(event:any) {
    this.logger.info(this, "onAppOnly", event);
    this.checkin.send_via = 'apponly';
    this.select.close();
  }

  private showPopover(event:any) {
    this.logger.info(this, "showPopover", event, this.checkin.send_via);
    let popover = this.popoverController.create(SendViaComponent,
      { send_via: this.checkin.send_via,
        app_enabled: this.organization.app_enabled,
        email_enabled: this.organization.email_enabled,
        sms_enabled: this.organization.sms_enabled && this.organization.credits > 0,
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

}
