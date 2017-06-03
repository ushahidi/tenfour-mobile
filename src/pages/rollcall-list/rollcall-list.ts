import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Events, Button, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { RollcallRepliesPage } from '../../pages/rollcall-replies/rollcall-replies';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Rollcall } from '../../models/rollcall';
import { Token } from '../../models/token';

@IonicPage()
@Component({
  selector: 'page-rollcall-list',
  templateUrl: 'rollcall-list.html',
  providers: [ ApiService ],
  entryComponents:[ RollcallRepliesPage ]
})
export class RollcallListPage extends BasePage {

  @ViewChild('notifications')
  notifications:Button;

  @ViewChild('create')
  create:Button;

  organization:Organization = null;

  loading:boolean = false;

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
    this.events.publish("organization:loaded", this.organization);
    this.loadRollCalls(null, true);
  }

  loadRollCalls(event:any, cache:boolean=true) {
    this.loading = true;
    if (cache) {
      this.database.getRollcalls(this.organization).then((rollcalls:Rollcall[]) => {
        if (rollcalls && rollcalls.length > 0) {
          this.organization.rollcalls = rollcalls;
          if (event) {
            event.complete();
          }
          this.loading = false;
        }
        else {
          this.loadRollCalls(event, false);
        }
      });
    }
    else {
      this.api.getToken().then(
        (token:Token) => {
          this.api.getRollcalls(token, this.organization).then(
            (rollcalls:Rollcall[]) => {
              this.organization.rollcalls = rollcalls;
              if (event) {
                event.complete();
              }
              this.loading = false;
            },
            (error:any) => {
              if (event) {
                event.complete();
              }
              this.loading = false;
              this.showToast(error);
            });
        },
        (error:any) => {
          if (event) {
            event.complete();
          }
          this.loading = false;
          this.showToast(error);
        });
    }
  }

  showReplies(event:any, rollcall:Rollcall) {
    this.showPage(RollcallRepliesPage, {
      organization: this.organization,
      rollcall: rollcall })
  }

}
