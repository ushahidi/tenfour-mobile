import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';

@IonicPage()
@Component({
  selector: 'page-person-invite',
  templateUrl: 'person-invite.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[  ]
})
export class PersonInvitePage extends BasePage {

  organization:Organization = null;
  person:Person = null;
  people:Person[] = null;
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
      protected statusBar:StatusBar) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.loadPeople(null, true);
    this.statusBar.overlaysWebView(false);
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.trackPage({
      organization: this.organization.name
    });
  }

  ionViewWillLeave() {
    super.ionViewWillLeave();
    this.statusBar.overlaysWebView(true);
  }

  private cancelInvite(event:any) {
    this.hideModal();
  }

  private invitePeople(event:any) {
    let invites = [];
    for (let person of this.people) {
      if (person.selected == true) {
        invites.push(this.invitePerson(person));
      }
    }
    if (invites.length > 0) {
      let loading = this.showLoading("Inviting...");
      Promise.all(invites).then(invited => {
        loading.dismiss();
        this.showToast("Invites sent");
        let firstViewController = this.navController.first();
        this.navController.popToRoot({ animate: false }).then(() => {
          firstViewController.dismiss({ });
        });
      });
    }
    else {
      this.showToast("No invites sent");
      this.hideModal();
    }
  }

  private loadPeople(event:any, cache:boolean=true) {
    this.loading = true;
    if (cache) {
      return this.database.getPeople(this.organization).then((people:Person[]) => {
        this.logger.info(this, "loadPeople", people);
        if (people && people.length > 0) {
          this.people = people.filter(person => person.needsInvite() == true);
          this.logger.info(this, "loadPeople", this.people);
          if (event) {
            event.complete();
          }
          this.loading = false;
        }
        else {
          this.loadPeople(event, false);
        }
      });
    }
    else {
      return this.api.getPeople(this.organization).then(
        (people:Person[]) => {
          this.people = people.filter(person => person.needsInvite() == true);
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
    }
  }

  private invitePerson(person:Person):Promise<Person> {
    return new Promise((resolve, reject) => {
      this.api.invitePerson(this.organization, person).then((invited:Person) => {
        resolve(invited);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

}
