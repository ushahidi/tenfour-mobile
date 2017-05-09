import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput,
         Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { SignupPlanPage } from '../../pages/signup-plan/signup-plan';

@IonicPage()
@Component({
  selector: 'page-signup-url',
  templateUrl: 'signup-url.html',
  entryComponents:[ SignupPlanPage ]
})
export class SignupUrlPage extends BasePage {

  @ViewChild('url')
  url:TextInput;

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

  onNext(event) {
    this.logger.info(this, "onNext");
    this.showPage(SignupPlanPage, {});
  }

}
