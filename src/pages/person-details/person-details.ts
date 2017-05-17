import { Component, NgZone } from '@angular/core';
import { IonicPage, Events, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Contact } from '../../models/contact';
import { Token } from '../../models/token';

@IonicPage()
@Component({
  selector: 'page-person-details',
  templateUrl: 'person-details.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[  ]
})
export class PersonDetailsPage extends BasePage {

  organization:Organization = null;
  person:Person = null;

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
    this.person = this.getParameter<Person>("person");
    this.loadPerson(null, true);
  }

  loadPerson(event:any, cache:boolean=true) {
    if (cache) {
      this.database.getContacts(this.person).then((contacts:Contact[]) => {
        if (contacts && contacts.length > 0) {
          this.person.contacts = contacts;
          if (event) {
            event.complete();
          }
        }
        else {
          this.loadPerson(event, false);
        }
      });
    }
    else {
      this.api.getToken().then((token:Token) => {
        this.api.getPerson(token, this.organization, this.person.id).then(
          (person:Person) => {
            this.person = person;
            if (event) {
              event.complete();
            }
          },
          (error:any) => {
            if (event) {
              event.complete();
            }
            this.showToast(error);
          });
      });
    }
  }

  editPerson(event) {
    this.logger.info(this, "editPerson");
  }
}
