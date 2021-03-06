import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController, PopoverController, Modal } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';
import { PersonDetailsPage } from '../../pages/person-details/person-details';
import { PersonEditPage } from '../../pages/person-edit/person-edit';
import { BulkActionsComponent } from '../../components/bulk-actions/bulk-actions';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'PersonListPage',
  segment: 'people'
})
@Component({
  selector: 'page-person-list',
  templateUrl: 'person-list.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ PersonDetailsPage, PersonEditPage ]
})
export class PersonListPage extends BasePrivatePage {

  organization:Organization = null;
  user:User = null;
  loading:boolean = false;
  limit:number = 20;
  offset:number = 0;
  filter:String = '';
  selectedPeople:Person[] = [];
  selectAll:boolean = false;

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
      protected popoverController:PopoverController,
      protected api:ApiProvider,
      protected storage:StorageProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, storage);
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
    this.limit = this.website ? 30 : 20;
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

  private loadUpdates(cache:boolean=true, event:any=null) {
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

  private loadPeople(cache:boolean=true) {
    return new Promise((resolve, reject) => {
      this.offset = 0;
      this.promiseFallback(cache,
        this.storage.getPeople(this.organization, null, this.limit, this.offset, this.filter),
        this.api.getPeople(this.organization, this.limit, this.offset, this.filter), 2).then((people:Person[]) => {
          this.storage.savePeople(this.organization, people).then((saved:boolean) => {
            this.organization.people = people;
            this.organization.people.forEach(person => {
              person.selected = !!this.selectedPeople.find(selectedPerson => { return selectedPerson.id === person.id; });
            });
            resolve(people);
          });
        },
        (error:any) => {
          this.organization.people = [];
          reject(error);
        });
    });
  }

  private loadMore(event:any) {
    return new Promise((resolve, reject) => {
      this.offset = this.offset + this.limit;
      this.logger.info(this, "loadMore", "Limit", this.limit, "Offset", this.offset);
      this.promiseFallback(true,
        this.storage.getPeople(this.organization, null, this.limit, this.offset),
        this.api.getPeople(this.organization, this.limit, this.offset), 1).then((people:Person[]) => {
          this.storage.savePeople(this.organization, people).then((saved:boolean) => {
            this.organization.people = [...this.organization.people, ...people];
            if (event) {
              event.complete();
            }
            this.logger.info(this, "loadMore", "Limit", this.limit, "Offset", this.offset, "Total", this.organization.people.length);
            resolve(this.organization.people);
          });
        });
    });
  }

  private addPerson() {
    this.logger.info(this, "addPerson");
    let modal = this.showModal(PersonEditPage, {
      organization: this.organization,
      user: this.user
    });
    modal.onDidDismiss(data => {
      this.logger.info(this, "addPerson", "Modal", data);
      if (data) {
        let loading = this.showLoading("Loading...");
        this.loadPeople(false).then((finished:any) => {
          loading.dismiss();
          if (data.person && data.person.name) {
            this.showToast(`Added ${data.person.name}`);
          }
        },
        (error:any) => {
          loading.dismiss();
        });
      }
    });
  }

  private showPerson(person:Person, event:any=null) {
    this.logger.info(this, "showPerson", person);
    if (!person) {
      return this.logger.error(this, "showPerson", "person is not defined");
    }
    let modal = this.showModalOrPage(PersonDetailsPage, {
      organization: this.organization,
      user: this.user,
      person: person,
      person_id: person.id
    });
    if (modal instanceof Modal) {
      modal.onDidDismiss(data => {
        this.logger.info(this, "showPerson", "Dismissed");
        if (data && data.removed) {
          let loading = this.showLoading("Loading...");
          this.loadPeople(false).then((finished:any) => {
            loading.dismiss();
          },
          (error:any) => {
            loading.dismiss();
          });
        }
      });
    }
  }

  private removePerson(person:Person, event:any=null) {
    this.logger.info(this, "removePerson", person);
    let loading = this.showLoading("Removing...", true);
    this.api.deletePerson(this.organization, person).then((deleted:any) => {
      if (this.mobile) {
        let removes = [];
        removes.push(this.storage.removePerson(this.organization, person));
        for (let contact of person.contacts) {
          removes.push(this.storage.removeContact(this.organization, contact));
        }
        Promise.all(removes).then(removed => {
          let index = this.organization.people.indexOf(person);
          if (index > -1) {
            this.organization.people.splice(index, 1);
          }
          loading.dismiss();
        });
      }
      else {
        let index = this.organization.people.indexOf(person);
        if (index > -1) {
          this.organization.people.splice(index, 1);
        }
        loading.dismiss();
      }
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Removing Person", error);
    });
  }

  private onFilter($event) {
    this.logger.info(this, "onFilter", this.filter);
    this.loading = true;
    this.loadPeople(false).then((people:Person[]) => {
      this.loading = false;
    },
    (error:any) => {
      this.loading = false;
      this.showToast(error);
    });
  }

  private onPersonSelected(person, $event) {
    this.logger.info(this, "onPersonSelected", person);
    if (!person.selected) {
      this.selectedPeople = this.selectedPeople.filter(selectedPerson => {
        return selectedPerson.id !== person.id;
      });
    }
    else {
      if (!this.selectedPeople.find(selectedPerson => {
        return selectedPerson.id === person.id;
      })) {
        this.selectedPeople.push(person);
      }
    }
  }

  private showActionsPopover($event) {
    this.logger.info(this, 'showActionsPopover');
    let popover = this.popoverController.create(BulkActionsComponent, {
      organization: this.organization,
      people: this.selectedPeople
    });
    popover.onDidDismiss(data => {
      this.logger.info(this, 'showActionsPopover', 'onDidDismiss');
      this.loadUpdates();
    });
    popover.present({
      ev: $event
    });
  }

  get selectAllIndeterminate() {
    if (this.selectedPeople.length === 0) {
      return false;
    }
    else {
      return !!this.organization.people.find(person => {
        return !person.selected;
      });
    }
  }

  private onChangeSelectAll($event) {
    this.logger.info(this, "onChangeSelectAll", this.selectAll);

    if (this.selectAllIndeterminate || !this.selectAll) {
      this.organization.people.forEach(person => {
        person.selected = false;
      })
      this.selectedPeople.length = 0;
      this.selectAll = false;
      $event.checked = false;
    }
    else {
      this.organization.people.forEach(person => {
        person.selected = true;
        this.selectedPeople.push(person);
      });
    }
  }

}
