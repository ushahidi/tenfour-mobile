import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { Camera, CameraOptions } from '@ionic-native/camera';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { Organization } from '../../models/organization';

@IonicPage()
@Component({
  selector: 'page-settings-edit',
  templateUrl: 'settings-edit.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[  ]
})
export class SettingsEditPage extends BasePage {

  organization:Organization = null;
  logo:string = "assets/images/dots.png";
  location:string = null;

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
      protected camera:Camera) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
  }

  cancelEdit(event:any) {
    this.hideModal();
  }

  doneEdit(event:any) {
    let loading = this.showLoading("Updating...");
    this.api.updateOrganization(this.organization).then((organization:Organization) => {
      this.database.saveOrganization(organization).then(saved => {
        loading.dismiss();
        this.hideModal({ organization: organization });
      });
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Updating Organization", error);
    });
  }

  showCameraRoll(event:any) {
    this.logger.info(this, "showCameraRoll");
    let options:CameraOptions = {
      mediaType: this.camera.MediaType.PICTURE,
      encodingType: this.camera.EncodingType.JPEG,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
    }
    this.camera.getPicture(options).then((imageData:any) => {
      this.logger.info(this, "showCameraRoll", "Selected");
      this.organization.profile_picture = 'data:image/jpeg;base64,' + imageData;
    },
    (error:any) => {
      this.logger.error(this, "showCameraRoll", error);
      this.showAlert("Problem Selecting Photo", error);
    });
  }

}
