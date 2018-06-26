import { Component, NgZone } from '@angular/core';
import { IonicPage, Events, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { PersonDetailsPage } from '../../pages/person-details/person-details';
import { PersonEditPage } from '../../pages/person-edit/person-edit';
import { CheckinDetailsPage } from '../../pages/checkin-details/checkin-details';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Person } from '../../models/person';
import { Contact } from '../../models/contact';
import { Checkin } from '../../models/checkin';
import { Reply } from '../../models/reply';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'PersonProfilePage',
  segment: 'profile'
})
@Component({
  selector: 'page-person-details',
  templateUrl: '../../pages/person-details/person-details.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ PersonEditPage, CheckinDetailsPage ]
})
export class PersonProfilePage extends PersonDetailsPage {

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
      protected storage:StorageProvider,
      protected events:Events) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, api, storage, events);
    this.profile = true;
  }

  protected loadPerson(cache:boolean=true):Promise<Person> {
    return new Promise((resolve, reject) => {
      if (cache && this.person) {
        resolve(this.person);
      }
      else if (cache && this.hasParameter("person")){
        this.person = this.getParameter<Person>("person");
        resolve(this.person);
      }
      else if (this.hasParameter("person_id")) {
        let personId = this.getParameter<number>("person_id");
        this.promiseFallback(cache,
          this.storage.getPerson(this.organization, personId),
          this.api.getPerson(this.organization, personId)).then((person:Person) => {
            this.person = person;
            resolve(person);
        },
        (error:any) => {
          resolve(null);
        });
      }
      else {
        this.storage.getUser().then((user:User) => {
          this.person = user;
          resolve(this.person);
        });
      }
    });
  }

}
