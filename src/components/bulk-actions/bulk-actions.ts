import { Component, NgZone, ViewChild, OnInit } from '@angular/core';
import { IonicPage, Button, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { BulkAddToGroupPage } from '../../pages/bulk-addtogroup/bulk-addtogroup';
import { BulkChangeRolePage } from '../../pages/bulk-changerole/bulk-changerole';
import { BulkInvitePage } from '../../pages/bulk-invite/bulk-invite';
import { BulkRemovePage } from '../../pages/bulk-remove/bulk-remove';

import { Person } from '../../models/person';
import { Organization } from '../../models/organization';

import { StorageProvider } from '../../providers/storage/storage';

@Component({
  selector: 'bulk-actions',
  templateUrl: 'bulk-actions.html'
})
export class BulkActionsComponent extends BasePage implements OnInit {

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

  addToGroup() {
    this.showModalOrPage(BulkAddToGroupPage, {
      people: this.people,
      organization: this.organization
    });
    this.viewController.dismiss();
  }

  changeRole() {
    this.showModalOrPage(BulkChangeRolePage, {
      people: this.people,
      organization: this.organization
    });
    this.viewController.dismiss();
  }

  sendInvite() {
    this.showModalOrPage(BulkInvitePage, {
      people: this.people,
      organization: this.organization
    });
    this.viewController.dismiss();
  }

  remove() {
    this.showModalOrPage(BulkRemovePage, {
      people: this.people,
      organization: this.organization
    });
    this.viewController.dismiss();
  }

}
