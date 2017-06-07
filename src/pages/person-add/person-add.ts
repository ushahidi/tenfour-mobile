import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { PersonEditPage } from '../../pages/person-edit/person-edit';
import { PersonInvitePage } from '../../pages/person-invite/person-invite';
import { PersonImportPage } from '../../pages/person-import/person-import';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';

@IonicPage()
@Component({
  selector: 'page-person-add',
  templateUrl: 'person-add.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[ PersonEditPage, PersonInvitePage ]
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
      protected database:DatabaseService) {
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
    this.showModal(PersonEditPage,
      { organization: this.organization });
  }

  invitePerson(event) {
    this.logger.info(this, "invitePerson");
    this.showModal(PersonInvitePage,
      { organization: this.organization });
  }

  importPerson(event) {
    this.logger.info(this, "importPerson");
    this.showModal(PersonImportPage,
      { organization: this.organization });
  }

}
