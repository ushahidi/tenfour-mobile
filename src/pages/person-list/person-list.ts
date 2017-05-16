import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Events, Button, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { PersonAddPage } from '../../pages/person-add/person-add';
import { PersonDetailsPage } from '../../pages/person-details/person-details';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Token } from '../../models/token';

@IonicPage()
@Component({
  selector: 'page-person-list',
  templateUrl: 'person-list.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[ PersonAddPage, PersonDetailsPage ]
})
export class PersonListPage extends BasePage {

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
      protected database:DatabaseService,
      protected events:Events) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.events.publish("organization:loaded", this.organization);
    this.database.getPeople(this.organization).then((people:Person[]) => {
      this.organization.people = people;
    });
    // this.database.getTokens(this.organization).then((tokens:Token[]) => {
    //   let token = tokens[0];
    //   this.api.getPeople(token, this.organization).then(
    //     (people:Person[]) => {
    //       this.organization.people = people;
    //     });
    // });
  }

  addPeople(event:any) {
    this.logger.info(this, "addPeople");
    this.showModal(PersonAddPage,
      { organization: this.organization });
  }

  showPerson(event:any, person:Person) {
    this.logger.info(this, "showPerson");
    this.showPage(PersonDetailsPage,
      { organization: this.organization,
        person: person })
  }

}
