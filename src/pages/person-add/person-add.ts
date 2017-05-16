import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Events, Button, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';

@IonicPage()
@Component({
  selector: 'page-person-add',
  templateUrl: 'person-add.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[  ]
})
export class PersonAddPage extends BasePage {

  organization:Organization = null;

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
      protected events:Events) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
  }

  onCancel(event) {
    this.hideModal();
  }

  addPerson(event) {
    this.logger.info(this, "addPerson");
  }

  invitePerson(event) {
    this.logger.info(this, "invitePerson");
  }

  importPerson(event) {
    this.logger.info(this, "importPerson");
  }

}
