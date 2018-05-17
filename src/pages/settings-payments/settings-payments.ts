import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { BasePage } from '../../pages/base-page/base-page';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';

import { ApiProvider } from '../../providers/api/api';
import { DatabaseProvider } from '../../providers/database/database';

@IonicPage({
  segment: 'settings/payments',
  defaultHistory: ['SettingsListPage']
})
@Component({
  selector: 'page-settings-payments',
  templateUrl: 'settings-payments.html',
  providers: [ ApiProvider, DatabaseProvider ],
  entryComponents:[  ]
})
export class SettingsPaymentsPage extends BasePage {

  organization:Organization = null;
  person:Person = null;
  website:string = "https://app.tenfour.org/settings/plan-and-credits";
  url:SafeResourceUrl = null;

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
      protected api:ApiProvider,
      protected database:DatabaseProvider,
      protected sanitizer:DomSanitizer) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.person = this.getParameter<Person>("person");
    this.loadPaymentForm();
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    if (this.organization) {
      this.trackPage({
        organization: this.organization.name
      });
    }
  }

  private loadPaymentForm() {
    if (this.person.isOwner()) {
      this.api.getPaymentUrl(this.organization).then((url:string) => {
        this.logger.info(this, "ChargeBee", url);
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      },
      (error:any) => {
        this.logger.error(this, "ChargeBee", error);
      });
    }
  }

  private cancelEdit(event:any) {
    this.hideModal();
  }

  private doneEdit(event:any) {
    //TODO wire up credit card payments
    this.hideModal();
  }

}
