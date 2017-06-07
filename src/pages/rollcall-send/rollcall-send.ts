import { Component, NgZone } from '@angular/core';
import { IonicPage, Events, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Rollcall } from '../../models/rollcall';
import { Token } from '../../models/token';

@IonicPage()
@Component({
  selector: 'page-rollcall-send',
  templateUrl: 'rollcall-send.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[  ]
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
      protected database:DatabaseService) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.rollcall = this.getParameter<Rollcall>("rollcall");
  }

  addPerson() {
    
  }

  sendRollcall(event:any) {
    // let loading = this.showLoading("Creating...");
    // this.api.getToken().then((token:Token) => {
    //   this.api.createPerson(token, this.person).then((person:Person) => {
    //     let updates = [];
    //     for (let contact of this.person.contacts) {
    //       updates.push(this.updateContact(token, person, contact));
    //     }
    //     Promise.all(updates).then((updated:any) => {
    //       this.database.savePerson(this.organization, person).then((saved:any) => {
    //         loading.dismiss();
    //         this.hideModal(person);
    //       });
    //     },
    //     (error:any) => {
    //       loading.dismiss();
    //       this.showAlert("Problem Creating Contacts", error);
    //     });
    //   },
    //   (error:any) => {
    //     loading.dismiss();
    //     this.showAlert("Problem Creating Person", error);
    //   });
    // });
  }

}
