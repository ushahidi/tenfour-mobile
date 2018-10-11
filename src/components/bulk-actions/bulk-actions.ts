import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Button, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { BulkAddToGroupPage } from '../../pages/bulk-addtogroup/bulk-addtogroup';
import { Person } from '../../models/person';

import { Organization } from '../../models/organization';

import { StorageProvider } from '../../providers/storage/storage';

@Component({
  selector: 'bulk-actions',
  templateUrl: 'bulk-actions.html'
})
export class BulkActionsComponent extends BasePage {

  people:Person[];
  organization:Organization;

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
      protected storage:StorageProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ngOnInit() {
    this.people = this.navParams.get('people');
    this.organization = this.navParams.get('organization');
  }

  private addToGroup() {
    this.showModalOrPage(BulkAddToGroupPage, {
      people: this.people,
      organization: this.organization
    });
    this.viewController.dismiss();
  }

}
