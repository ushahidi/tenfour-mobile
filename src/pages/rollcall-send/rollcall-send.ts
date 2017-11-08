import { Component, ViewChild, NgZone } from '@angular/core';
import { IonicPage, Select, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController, PopoverController } from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';

import { BasePage } from '../../pages/base-page/base-page';
import { PersonSelectPage } from '../../pages/person-select/person-select';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { SendViaComponent } from '../../components/send-via/send-via';

import { Organization } from '../../models/organization';
import { Rollcall } from '../../models/rollcall';
import { Recipient } from '../../models/recipient';
import { Group } from '../../models/group';
import { Person } from '../../models/person';

@IonicPage()
@Component({
  selector: 'page-rollcall-send',
  templateUrl: 'rollcall-send.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[ PersonSelectPage ]
})
export class RollcallSendPage extends BasePage {

  organization:Organization = null;
  rollcall:Rollcall = null;
  person:Person = null;

  @ViewChild('select')
  select: Select;

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
      protected api:ApiService,
      protected database:DatabaseService,
      protected statusBar:StatusBar) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.rollcall = this.getParameter<Rollcall>("rollcall");
    this.person = this.getParameter<Person>("person");
    this.statusBar.overlaysWebView(false);
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.trackPage({
      organization: this.organization.name,
      rollcall: this.rollcall.message
    });
  }

  ionViewWillLeave() {
    super.ionViewWillLeave();
    this.statusBar.overlaysWebView(true);
  }

  private addPerson() {
    this.logger.info(this, "addPerson");
    let modal = this.showModal(PersonSelectPage, {
      organization: this.organization,
      groups: this.rollcall.groups,
      people: this.rollcall.recipients,
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
         this.rollcall.recipients = recipients;
       }
       if (data && data.groups) {
         this.rollcall.groups = data.groups;
       }
     });
  }

  private removeRecipient(recipient:Recipient) {
    this.logger.info(this, "removeRecipient", recipient);
    for (let i = 0; i < this.rollcall.recipients.length; i++) {
      if (this.rollcall.recipients[i] === recipient) {
        this.rollcall.recipients.splice(i, 1);
        break;
      }
    }
  }

  private removeGroup(group:Group) {
    this.logger.info(this, "removeGroup", group);
    for (let i = 0; i < this.rollcall.groups.length; i++) {
      if (this.rollcall.groups[i] === group) {
        this.rollcall.groups.splice(i, 1);
        break;
      }
    }
  }

  private sendRollcall(event:any) {
    if (this.rollcall.send_via == null || this.rollcall.send_via.length == 0) {
      this.showToast("Please select how the RollCall will be sent");
    }
    else {
      let loading = this.showLoading("Sending...");
      this.api.postRollcall(this.organization, this.rollcall).then((rollcall:Rollcall) => {
        let saves = [];
        for (let answer of rollcall.answers) {
          saves.push(this.database.saveAnswer(rollcall, answer));
        }
        for (let recipient of rollcall.recipients) {
          saves.push(this.database.saveRecipient(rollcall, recipient));
        }
        for (let reply of rollcall.replies) {
          saves.push(this.database.saveReply(rollcall, reply));
        }
        saves.push(this.database.saveRollcall(this.organization, rollcall));
        Promise.all(saves).then(saved => {
          loading.dismiss();
          this.showToast("RollCall sent");
          let firstViewController = this.navController.first();
          this.navController.popToRoot({ animate: false }).then(() => {
            firstViewController.dismiss({ rollcall: Rollcall });
          });
        });
      },
      (error:any) => {
        loading.dismiss();
        this.showAlert("Problem Creating Rollcall", error);
      });
    }
  }

  private onAppOnly(event:any) {
    this.logger.info(this, "onAppOnly", event);
    this.rollcall.send_via = 'apponly';
    this.select.close();
  }

  private showPopover(event:any) {
    this.logger.info(this, "showPopover", event, this.rollcall.send_via);
    let popover = this.popoverController.create(SendViaComponent,
      { send_via: this.rollcall.send_via,
        app_enabled: this.organization.app_enabled,
        email_enabled: this.organization.email_enabled,
        sms_enabled: this.organization.sms_enabled && this.organization.credits > 0,
        twitter_enabled: this.organization.twitter_enabled,
        slack_enabled: this.organization.slack_enabled,
        on_changed:(send_via:any) => {
            this.logger.info(this, "sendViaChanged", send_via);
            this.rollcall.send_via = send_via;
          }
        },
      { showBackdrop: true,
        enableBackdropDismiss: true });
    popover.present({
      ev: event
    });
  }

}
