import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput,
         Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { SignupUrlPage } from '../../pages/signup-url/signup-url';

@IonicPage()
@Component({
  selector: 'page-signup-name',
  templateUrl: 'signup-name.html',
  entryComponents:[ SignupUrlPage ]
})
export class SignupNamePage extends BasePage {

  @ViewChild('name')
  name:TextInput;

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
    this.showPage(SignupUrlPage, {});
  }

}
