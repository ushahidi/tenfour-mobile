import { Component, NgZone } from '@angular/core';
import { IonicPage, Events, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Token } from '../../models/token';

@IonicPage()
@Component({
  selector: 'page-person-edit',
  templateUrl: 'person-edit.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[  ]
})
export class PersonEditPage extends BasePage {

  organization:Organization = null;
  person:Person = null;
  editing:boolean = true;

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
    if (this.person) {
      this.editing = true;
    }
    else {
      this.editing = false;
      this.person = new Person({
        name: null,
        description: null,
        organization_id: this.organization.id
      });
    }
  }

  cancelEdit(event) {
    this.hideModal();
  }

  createPerson(event) {
    let loading = this.showLoading("Creating...");
    this.api.getToken().then((token:Token) => {
      this.api.createPerson(token, this.person).then((posted:Person) => {
        this.database.savePerson(this.organization, posted).then(saved => {
          loading.dismiss();
          this.hideModal(this.person);
        });
      });
    });
  }

  updatePerson(event) {
    let loading = this.showLoading("Updating...");
    this.api.getToken().then((token:Token) => {
      this.api.updatePerson(token, this.person).then((posted:Person) => {
        this.database.savePerson(this.organization, posted).then(saved => {
          loading.dismiss();
          this.hideModal(this.person);
        });
      });
    });
  }

}
