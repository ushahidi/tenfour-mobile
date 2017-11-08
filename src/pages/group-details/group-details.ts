import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { GroupEditPage } from '../../pages/group-edit/group-edit';
import { PersonDetailsPage } from '../../pages/person-details/person-details';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Group } from '../../models/group';

@IonicPage()
@Component({
  selector: 'page-group-details',
  templateUrl: 'group-details.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[ GroupEditPage, PersonDetailsPage ]
})
export class GroupDetailsPage extends BasePage {

  organization:Organization = null;
  group:Group = null;
  person:Person = null;
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
      protected database:DatabaseService) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
    this.organization = this.getParameter<Organization>("organization");
    this.person = this.getParameter<Person>("person");
    this.group = this.getParameter<Group>("group");
    let loading = this.showLoading("Loading...");
    this.loadGroup(true).then(loaded => {
      loading.dismiss();
    });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.trackPage({
      organization: this.organization.name,
      group: this.group.name
    });
  }

  private loadGroup(cache:boolean=true, event:any=null) {
    return new Promise((resolve, reject) => {
      if (cache) {
        this.database.getGroup(this.organization, this.group.id).then((group:Group) => {
          this.group = group;
          if (event) {
            event.complete();
          }
          resolve(group);
        },
        (error:any) => {
          if (event) {
            event.complete();
          }
          reject(error);
        });
      }
      else {
        this.api.getGroup(this.organization, this.group.id).then((group:Group) => {
          this.database.saveGroup(this.organization, group).then((saved:any) => {
            this.group = group;
            if (event) {
              event.complete();
            }
            resolve(group);
          });
        },
        (error:any) => {
          if (event) {
            event.complete();
          }
          reject(error);
        });
      }
    });
  }

  private editGroup(event:any) {
    this.logger.info(this, "editGroup");
    this.showModal(GroupEditPage,
      { organization: this.organization,
        person: this.person,
        group: this.group })
  }

  private showPerson(_person:Person) {
    this.logger.info(this, "showPerson", _person);
    this.showPage(PersonDetailsPage,
      { organization: this.organization,
        person: _person,
        user: this.person })
  }

}
