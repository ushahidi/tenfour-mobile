import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { RollcallListPage } from '../../pages/rollcall-list/rollcall-list';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';

@IonicPage()
@Component({
  selector: 'page-onboard-list',
  templateUrl: 'onboard-list.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[ RollcallListPage ]
})
export class OnboardListPage extends BasePage {

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
      protected database:DatabaseService) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.person = this.getParameter<Person>("person");
    this.person.config_added_people = false;
    this.person.config_profile_reviewed = false;
    this.person.config_self_test_sent = false;
  }

  taskAddPeople(event) {
    this.logger.info(this, "taskAddPeople");
    this.person.config_added_people = true;
  }

  taskReviewContact(event) {
    this.logger.info(this, "taskReviewContact");
    this.person.config_profile_reviewed = true;
  }

  taskSendRollCall(event) {
    this.logger.info(this, "taskSendRollCall");
    this.person.config_self_test_sent = true;
  }

  showRollcallList(event) {
    this.logger.info(this, "showRollcallList");
    this.showRootPage(RollcallListPage,
      { organization: this.organization });
  }

}
