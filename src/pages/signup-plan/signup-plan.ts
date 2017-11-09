import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput,
         Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { SignupPaymentPage } from '../../pages/signup-payment/signup-payment';
import { SignupPasswordPage } from '../../pages/signup-password/signup-password';

import { ApiService } from '../../providers/api-service';

import { Organization } from '../../models/organization';

@IonicPage()
@Component({
  selector: 'page-signup-plan',
  templateUrl: 'signup-plan.html',
  providers: [ ApiService ],
  entryComponents:[ SignupPaymentPage, SignupPasswordPage ]
})
export class SignupPlanPage extends BasePage {

  trial:boolean = false;
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
      protected actionController:ActionSheetController) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.trackPage();
  }

  private showNext(event:any) {
    if (this.trial) {
      this.logger.info(this, "showNext", "SignupPasswordPage");
      this.showPage(SignupPasswordPage,
        { organization: this.organization });
    }
    else {
      this.logger.info(this, "showNext", "SignupPaymentPage");
      this.showPage(SignupPaymentPage,
        { organization: this.organization });
    }
  }

  private startPlan(event:any) {
    this.logger.info(this, "startPlan");
    this.trial = false;
  }

  private startTrial(event:any) {
    this.logger.info(this, "startTrial");
    this.trial = true;
  }

  private needMore(event:any) {
    this.logger.info(this, "needMore");
  }

}
