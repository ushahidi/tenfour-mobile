import { Component, ViewChild, NgZone } from '@angular/core';
import { IonicPage, Select, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController, PopoverController } from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';

import { BasePage } from '../../pages/base-page/base-page';
import { PersonSelectPage } from '../../pages/person-select/person-select';

import { ApiProvider } from '../../providers/api/api';
import { DatabaseProvider } from '../../providers/database/database';

import { SendViaComponent } from '../../components/send-via/send-via';

import { Organization } from '../../models/organization';
import { Checkin } from '../../models/checkin';
import { Recipient } from '../../models/recipient';
import { Group } from '../../models/group';
import { Person } from '../../models/person';

@IonicPage()
@Component({
  selector: 'page-checkin-send',
  templateUrl: 'checkin-send.html',
  providers: [ ApiProvider, DatabaseProvider ],
  entryComponents:[ PersonSelectPage ]
})
export class CheckinSendPage extends BasePage {

  organization:Organization = null;
  checkin:Checkin = null;
  person:Person = null;

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
      protected database:DatabaseProvider,
      protected statusBar:StatusBar) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.checkin = this.getParameter<Checkin>("checkin");
    this.person = this.getParameter<Person>("person");
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.trackPage({
      organization: this.organization.name,
      checkin: this.checkin.message
    });
  }

  private addPerson() {
    this.logger.info(this, "addPerson");
    let modal = this.showModal(PersonSelectPage, {
      organization: this.organization,
      groups: this.checkin.groups,
      people: this.checkin.recipients,
      show_groups: true });
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
        let saves = [];
        for (let answer of checkin.answers) {
          saves.push(this.database.saveAnswer(this.organization, checkin, answer));
        }
        for (let recipient of checkin.recipients) {
          saves.push(this.database.saveRecipient(this.organization, checkin, recipient));
        }
        for (let reply of checkin.replies) {
          saves.push(this.database.saveReply(this.organization, checkin, reply));
        }
        saves.push(this.database.saveCheckin(this.organization, checkin));
        Promise.all(saves).then(saved => {
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
