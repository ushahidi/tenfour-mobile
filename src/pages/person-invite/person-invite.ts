import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'PersonInvitePage',
  segment: 'people/invite',
  defaultHistory: ['PersonListPage']
})
@Component({
  selector: 'page-person-invite',
  templateUrl: 'person-invite.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[  ]
})
export class PersonInvitePage extends BasePrivatePage {

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
      protected api:ApiProvider,
      protected storage:StorageProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    let loading = this.showLoading("Loading...");
    this.loadUpdates(true).then((loaded:any) => {
      loading.dismiss();
    });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    if (this.organization) {
      this.analytics.trackPage(this, {
        organization: this.organization.name
      });
    }
  }

  protected loadUpdates(cache:boolean=true, event:any=null) {
    this.logger.info(this, "loadUpdates");
    this.loading = true;
    return Promise.resolve()
      .then(() => { return this.loadOrganization(cache); })
      .then(() => { return this.loadUser(cache); })
      .then(() => { return this.loadPeople(cache); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Loaded");
        if (event) {
          event.complete();
        }
        this.loading = false;
      })
      .catch((error:any) => {
        this.logger.error(this, "loadUpdates", "Failed", error);
        if (event) {
          event.complete();
        }
        this.loading = false;
        this.showToast(error);
      });
  }

  private cancelInvite(event:any) {
    this.logger.info(this, 'cancelInvite');
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
      let loading = this.showLoading("Inviting...", true);
      Promise.all(invites).then(invited => {
        loading.dismiss();
        this.showToast("Invites sent");
        this.hideModal({people: invites});
      });
    }
    else {
      this.showToast("No invites sent");
      this.hideModal();
    }
  }

  private loadPeople(cache:boolean=true):Promise<Person[]> {
    return new Promise((resolve, reject) => {
      if (cache && this.mobile) {
        this.storage.getPeople(this.organization).then((people:Person[]) => {
          this.logger.info(this, "loadPeople", people);
          if (people && people.length > 0) {
            this.people = people.filter(person => person.needsInvite() == true);
            this.logger.info(this, "loadPeople", this.people);
            resolve(this.people);
          }
          else {
            this.loadPeople(false).then((people:Person[]) => {
              resolve(this.people);
            },
            (error:any) => {
              this.showToast(error);
            });
          }
        });
      }
      else {
        this.api.getPeople(this.organization).then((people:Person[]) => {
          this.people = people.filter(person => person.needsInvite() == true);
          resolve(this.people);
        },
        (error:any) => {
          this.showToast(error);
        });
      }
    });
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
