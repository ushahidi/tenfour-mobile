import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';

import { ApiProvider } from '../../providers/api/api';
import { CameraProvider } from '../../providers/camera/camera';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage({
  name: 'SettingsEditPage',
  segment: 'settings/edit',
  defaultHistory: ['SettingsListPage']
})
@Component({
  selector: 'page-settings-edit',
  templateUrl: 'settings-edit.html',
  providers: [ ApiProvider, StorageProvider ],
  entryComponents:[ ]
})
export class SettingsEditPage extends BasePage {

  organization:Organization = null;
  logo:string = "assets/images/dots.png";
  location:string = null;

  @ViewChild("fileInput")
  fileInput:any = null;
  cameraPresent:boolean = true;
  cameraRollPresent:boolean = true;

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
      protected camera:CameraProvider) {
      super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
    this.loadCamera();
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.organization = this.getParameter<Organization>("organization");
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    if (this.organization) {
      this.trackPage({
        organization: this.organization.name
      });
    }
  }

  private cancelEdit(event:any) {
    this.hideModal();
  }

  private doneEdit(event:any) {
    let loading = this.showLoading("Updating...");
    this.api.updateOrganization(this.organization).then((organization:Organization) => {
      this.storage.saveOrganization(organization).then(saved => {
        loading.dismiss();
        this.hideModal({
          organization: organization
        });
      });
    },
    (error:any) => {
      loading.dismiss();
      this.showAlert("Problem Updating Organization", error);
    });
  }

  private loadCamera() {
    this.camera.cameraPresent().then((cameraPresent:boolean) => {
      this.logger.info(this, "loadCamera", "cameraPresent", cameraPresent);
      this.cameraPresent = cameraPresent;
    });
    this.camera.cameraRollPresent().then((cameraRollPresent:boolean) => {
      this.logger.info(this, "loadCamera", "cameraRollPresent", cameraRollPresent);
      this.cameraRollPresent = cameraRollPresent;
    });
  }

  private showCameraOptions(event:any) {
    if (this.mobile) {
      let buttons = [];
      if (this.cameraPresent) {
        buttons.push({
          text: 'Take Photo',
          handler: () => {
            this.camera.showCamera().then((photo:any) => {
              this.organization.profile_picture = photo;
            },
            (error:any) => {
              this.organization.profile_picture = null;
              this.showAlert("Problem Taking Photo", error);
            });
          }
        });
      }
      if (this.cameraRollPresent) {
        buttons.push({
          text: 'Photo Library',
          handler: () => {
            this.camera.showCameraRoll().then((photo:any) => {
              this.organization.profile_picture = photo;
            },
            (error:any) => {
              this.organization.profile_picture = null;
              this.showAlert("Problem Taking Photo", error);
            });
          }
        });
      }
      buttons.push({
        text: 'Cancel',
        role: 'cancel'
      });
      let actionSheet = this.actionController.create({
        buttons: buttons
      });
      actionSheet.present();
    }
    else if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  private onFileChanged(event:any){
    this.logger.info(this, "onFileChanged", event.target);
    if (event.target.files && event.target.files.length > 0) {
      let reader = new FileReader();
      let file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {
        let imageData = reader.result.split(',')[1];
        if (imageData) {
          this.organization.profile_picture = 'data:image/jpeg;base64,' + imageData;
        }
        else {
          this.organization.profile_picture = null;
        }
      };
    }
  }

  private onKeyPress(event:any) {
    if (event.keyCode == 13) {
      this.logger.info(this, "onKeyPress", "Enter");
      this.hideKeyboard();
      return false;
    }
    else {
      return true;
    }
  }

}
