import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { ApiProvider } from '../../providers/api/api';

@IonicPage({
  name: 'UnsubscribePage',
  segment: 'unsubscribe/:email/:token/:org_name'
})
@Component({
  selector: 'page-unsubscribe',
  templateUrl: 'unsubscribe.html',
  providers: [ ApiProvider ]
})
export class UnsubscribePage extends BasePage {

  organization:string = null;
  token:string = null;
  email:string = null;

  ionViewWillEnter() {
    this.organization = this.getParameter<string>("org_name");
    this.token = this.getParameter<string>("token");
    this.email = this.getParameter<string>("email");
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.analytics.trackPage();
  }

  private confirm(event:any) {

  }

  private cancel(event:any) {

  }

}
