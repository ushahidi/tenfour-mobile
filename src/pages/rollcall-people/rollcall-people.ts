import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Rollcall } from '../../models/rollcall';
import { Person } from '../../models/person';

@IonicPage()
@Component({
  selector: 'page-rollcall-people',
  templateUrl: 'rollcall-people.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[  ]
})
export class RollcallPeoplePage extends BasePage {

  organization:Organization = null;
  rollcall:Rollcall = null;

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
      protected database:DatabaseService) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.rollcall = this.getParameter<Rollcall>("rollcall");
    this.loadPeople(null, true);
  }

  loadPeople(event:any, cache:boolean=true) {
    if (cache) {
      return this.database.getPeople(this.organization).then((people:Person[]) => {
        if (people && people.length > 1) {
          this.organization.people = people;
          if (event) {
            event.complete();
          }
        }
        else {
          this.loadPeople(event, false);
        }
      });
    }
    else {
      return this.api.getPeople(this.organization).then(
        (people:Person[]) => {
          this.organization.people = people;
          let saves = [];
          for (let person of people) {
            saves.push(this.database.savePerson(this.organization, person));
          }
          Promise.all(saves).then(saved => {
            if (event) {
              event.complete();
            }
          });
        },
        (error:any) => {
          if (event) {
            event.complete();
          }
          this.showToast(error);
        });
    }
  }

  cancelAdd(event) {
    this.hideModal();
  }

  doneAdd(event) {
    let groups = [];
    let people = [];
    for (let person of this.organization.people) {
      if (person.selected) {
        people.push(person);
      }
    }
    this.hideModal({
      groups:groups,
      people: people });
  }

}
