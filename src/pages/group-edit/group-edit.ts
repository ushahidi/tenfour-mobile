import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { PersonSelectPage } from '../../pages/person-select/person-select';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';
import { Group } from '../../models/group';

@IonicPage()
@Component({
  selector: 'page-group-edit',
  templateUrl: 'group-edit.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[ PersonSelectPage ]
})
export class GroupEditPage extends BasePage {

  organization:Organization = null;
  group:Group = null;
  person:Person = null;
  editing:boolean = false;
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
    if (this.group == null || this.group.id == null) {
      this.group = new Group({
        organization_id: this.organization.id
      });
      this.editing = false;
    }
    else {
      this.editing = true;
    }
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.trackPage({
      organization: this.organization.name,
      group: this.group.name
    });
  }

  private cancelEdit(event:any) {
    this.logger.info(this, "cancelEdit");
    this.hideModal();
  }

  private addPerson(event:any) {
    this.logger.info(this, "addPerson");
    let modal = this.showModal(PersonSelectPage, {
      organization: this.organization,
      show_groups: false });
    modal.onDidDismiss(data => {
       if (data && data.people) {
         let members = [];
         for (let person of data.people) {
           members.push(person);
         }
         this.group.members = members;
       }
     });
  }

  private createGroup(event:any) {
    this.logger.info(this, "createGroup");
    if (this.group.name.length == 0) {
      this.showAlert("Group Name Required", "Please enter the name of the group.");
    }
    else if (this.group.members.length == 0) {
      this.showAlert("Group People Required", "At least one person is required in a group.");
    }
    else {
      let loading = this.showLoading("Creating...");
      this.api.createGroup(this.organization, this.group).then((group:Group) => {
        if (this.group.members && this.group.members.length > 0) {
          group.member_count = this.group.members.length;
          group.member_ids = this.group.members.map(member => member.id).join(",");
        }
        else {
          group.member_count = 0;
          group.member_ids = "";
        }
        this.database.saveGroup(this.organization, group).then((saved:any) => {
          loading.dismiss();
          this.hideModal({ group: group });
        });
      },
      (error:any) => {
        loading.dismiss();
        this.showAlert("Problem Creating Group", error);
      });
    }
  }

  private updateGroup(event:any) {
    this.logger.info(this, "updateGroup", this.group.name, this.group.description);
    let loading = this.showLoading("Saving...");
    this.api.updateGroup(this.organization, this.group).then((group:Group) => {
      if (this.group.members && this.group.members.length > 0) {
        group.member_count = this.group.members.length;
        group.member_ids = this.group.members.map(member => member.id).join(",");
      }
      else {
        group.member_count = 0;
        group.member_ids = "";
      }
      this.database.saveGroup(this.organization, group).then((saved:any) => {
        loading.dismiss();
        this.hideModal({ group: group });
      });
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Updatig Group", error);
    });
  }

  private deleteGroup(event:any) {
    this.logger.info(this, "createGroup");
  }

  private removePerson(person:Person) {
    this.logger.info(this, "removePerson", person);
    for (let i = 0; i < this.group.members.length; i++) {
      if (this.group.members[i] === person) {
        this.group.members.splice(i, 1);
        break;
      }
    }
  }
}
