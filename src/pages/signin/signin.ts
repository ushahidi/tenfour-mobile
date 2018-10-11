import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, TextInput, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePublicPage } from '../../pages/base-public-page/base-public-page';
import { SigninUrlPage } from '../../pages/signin-url/signin-url';
import { SignupUrlPage } from '../../pages/signup-url/signup-url';

import { Organization } from '../../models/organization';
import { Checkin } from '../../models/checkin';
import { Answer } from '../../models/answer';
import { Reply } from '../../models/reply';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';
import { EnvironmentProvider } from '../../providers/environment/environment';

@IonicPage({
  name: 'SigninPage',
  segment: 'signin'
})
@Component({
  selector: 'page-signin',
  templateUrl: 'signin.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ SigninUrlPage, SignupUrlPage]
})
export class SigninPage extends BasePublicPage {

  organization:Organization = null;
  checkins:Checkin[] = [];

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
      protected storage:StorageProvider,
      protected environment:EnvironmentProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
    this.addCheckin("Please reply asap, are you ok?", "men", 5, 1, 1, 3);
    this.addCheckin("Is everyone ok from the fires?", "women", 3, 0, 1, 2);
    this.addCheckin("Did you make it home safe?", "men", 5, 1, 3, 1);
    this.addCheckin("Will you be joining the meeting on Friday?", "women", 3, 2, 3, 1);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.showModal(SigninUrlPage, {
      organization: this.organization
    }, {
      enableBackdropDismiss: false
    });
  }

  private addCheckin(message:string, gender:string, sent_count:number, waiting_count:number, replies_yes:number, replies_no:number) {
    let checkin = new Checkin({
        message: message,
        user_picture: `https://randomuser.me/api/portraits/${gender}/${this.checkins.length + 1}.jpg`,
        sent_count: sent_count,
        waiting_count: waiting_count
    });
    checkin.answers.push(new Answer({
      icon: "icon-exclaim",
      type: "negative",
      color: "#E7C24D",
      answer: "No",
      replies: replies_no
    }));
    checkin.answers.push(new Answer({
      icon: "icon-check",
      type: "positive",
      color: "#5BAA61",
      answer: "Yes",
      replies: replies_yes
    }));
    this.checkins.push(checkin);
  }

}
