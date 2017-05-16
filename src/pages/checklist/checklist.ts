import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Events, Button, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';

@IonicPage()
@Component({
  selector: 'page-checklist',
  templateUrl: 'checklist.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[  ]
})
export class ChecklistPage extends BasePage {

  organization:Organization = null;
  person:Person = null;

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
    this.person = this.getParameter<Person>("person");
    // this.person.config_added_people = true;
    // this.person.config_profile_reviewed = true;
    // this.person.config_self_test_sent = true;
  }

  taskAddPeople(event) {
    this.logger.info(this, "taskAddPeople");
  }

  taskReviewContact(event) {
    this.logger.info(this, "taskReviewContact");
  }

  taskSendRollCall(event) {
    this.logger.info(this, "taskSendRollCall");
  }

  getStarted(event) {
    this.logger.info(this, "getStarted");
  }

}
