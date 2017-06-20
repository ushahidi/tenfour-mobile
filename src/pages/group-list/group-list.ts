import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';
import { Group } from '../../models/group';

@IonicPage()
@Component({
  selector: 'page-group-list',
  templateUrl: 'group-list.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[  ]
})
export class GroupListPage extends BasePage {

  organization:Organization = null;
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

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
    this.loadUpdates(null, true);
  }

  loadUpdates(event:any, cache:boolean=true) {
    this.loading = true;
    Promise.all([
      this.loadGroups(cache)]).then(
      (loaded:any) =>{
        this.logger.info(this, "loadUpdates", "Done");
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

  loadGroups(cache:boolean=true):Promise<any> {
    return new Promise((resolve, reject) => {
      if (cache) {
        return this.database.getGroups(this.organization).then((groups:Group[]) => {
          if (groups && groups.length > 0) {
            this.organization.groups = groups;
            resolve(groups);
          }
          else {
            this.loadGroups(false);
          }
        });
      }
      else {
        return this.api.getGroups(this.organization).then(
          (groups:Group[]) => {
            let saves = [];
            for (let group of groups) {
              saves.push(this.database.saveGroup(this.organization, group));
            }
            Promise.all(saves).then(saved => {
              this.organization.groups = groups;
              resolve(groups);
            });
          },
          (error:any) => {
            reject(error);
          });
      }
    });
  }

}
