import { Component, NgZone } from '@angular/core';
import { IonicPage, Events, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';

import { BasePage } from '../../pages/base-page/base-page';
import { RollcallPeoplePage } from '../../pages/rollcall-people/rollcall-people';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Rollcall } from '../../models/rollcall';
import { Recipient } from '../../models/recipient';

@IonicPage()
@Component({
  selector: 'page-rollcall-send',
  templateUrl: 'rollcall-send.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[ RollcallPeoplePage ]
})
export class RollcallSendPage extends BasePage {

  organization:Organization = null;
  rollcall:Rollcall = null;

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
      protected api:ApiService,
      protected database:DatabaseService,
      protected statusBar:StatusBar) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.rollcall = this.getParameter<Rollcall>("rollcall");
    this.statusBar.overlaysWebView(false);
  }

  ionViewWillLeave() {
    super.ionViewWillLeave();
    this.statusBar.overlaysWebView(true);
  }

  addPerson() {
    let modal = this.showModal(RollcallPeoplePage, {
      organization: this.organization,
      rollcall: this.rollcall });
    modal.onDidDismiss(data => {
       if (data && data.people) {
         let recipients = [];
         for (let person of data.people) {
           let recipient = new Recipient(person);
           recipients.push(recipient);
         }
         this.rollcall.recipients = recipients;
       }
     });
  }

  removeRecipient(recipient:Recipient) {
    for (let i = 0; i < this.rollcall.recipients.length; i++) {
      if (this.rollcall.recipients[i] === recipient) {
        this.rollcall.recipients.splice(i, 1);
        break;
      }
    }
  }

  sendRollcall(event:any) {
    let loading = this.showLoading("Sending...");
    this.api.postRollcall(this.organization, this.rollcall).then((rollcall:Rollcall) => {
      this.database.saveRollcall(this.organization, rollcall).then(saved => {
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
