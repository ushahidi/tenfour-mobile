import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePrivatePage } from '../../pages/base-private-page/base-private-page';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'BulkInvitePage',
})
@Component({
  selector: 'bulk-invite',
  templateUrl: 'bulk-invite.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ ]
})
export class BulkInvitePage extends BasePrivatePage {

  loading:boolean = false;
  people:Person[] = [];
  organization:Organization;

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

  ionViewDidEnter() {
    super.ionViewDidEnter();

    this.people = this.navParams.get('people');
  }

  ionViewWillLeave() {
    super.ionViewWillLeave();
  }

  private get peopleWithoutEmail() {
    return this.people.filter(person => {
      return !person.hasEmails();
    });
  }

  private get peopleWithEmail() {
    return this.people.filter(person => {
      return person.hasEmails();
    });
  }

  private invite() {
    this.logger.info(this, "invite");

    let loading = this.showLoading("Inviting...", true);
    let promises = [];

    this.people.forEach(person => {
      if (!person.hasEmails()) {
        return;
      }

      promises.push(this.api.invitePerson(this.organization, person));
    });

    Promise.all(promises).then(() => {
        loading.dismiss();
        this.hideModal();

        if (promises.length) {
          this.showToast('Invited ' + promises.length + ' ' +
          (promises.length==1?'person':'people') +
          ' to the organization');
        }
    },(error:any) => {
      loading.dismiss();
      this.showAlert("Problem Inviting People", error);
    });
  }
}
