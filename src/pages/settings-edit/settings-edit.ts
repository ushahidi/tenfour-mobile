import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, Platform, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { Organization } from '../../models/organization';
import { User } from '../../models/user';
import { Location } from '../../models/location';

import { ApiProvider } from '../../providers/api/api';
import { CameraProvider } from '../../providers/camera/camera';
import { StorageProvider } from '../../providers/storage/storage';
import { LocationProvider } from '../../providers/location/location';

import { LocationSuggestComponent } from '../../components/location-suggest/location-suggest';

@IonicPage({
  name: 'SettingsEditPage',
  segment: 'settings/edit',
  defaultHistory: ['SettingsListPage']
})
@Component({
  selector: 'page-settings-edit',
  templateUrl: 'settings-edit.html',
  providers: [ ApiProvider, StorageProvider, LocationProvider ],
  entryComponents:[ ]
})
export class SettingsEditPage extends BasePage {

  organization:Organization = null;
  logo:string = "assets/images/dots.png";

  @ViewChild("fileInput")
  fileInput:any = null;
  cameraPresent:boolean = true;
  cameraRollPresent:boolean = true;
  search:string = null;

  locations:Location[] = [];
  timer:any = null;

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
      protected camera:CameraProvider,
      protected location:LocationProvider) {
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
      this.analytics.trackPage(this, {
        organization: this.organization.name
      });
    }
  }

  private cancelEdit(event:any) {
    this.hideModal();
  }

  private doneEdit(event:any) {
    let loading = this.showLoading("Updating...", true);
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
    this.logger.info(this, "onKeyPress", event.keyCode);
    if (this.isKeyReturn(event)) {
      this.logger.info(this, "onKeyPress", "Enter");
      this.hideKeyboard(event);
      return false;
    }
    else {
      return true;
    }
  }

  private searchAddress() {
    clearTimeout(this.timer);
    this.timer = setTimeout((address:string) => {
      if (address && address.length > 0) {
        this.logger.info(this, "searchAddress", address);
        this.location.searchAddress(address, 5).then((locations:Location[]) => {
          this.logger.info(this, "searchAddress", address, locations);
          this.zone.run(() => {
            this.locations = locations;
          });
        },
        (error:any) => {
          this.logger.error(this, "searchAddress", address, error);
          this.zone.run(() => {
            this.locations = [];
          });
        });
      }
      else {
        this.zone.run(() => {
          this.locations = [];
        });
      }
    }, 900, this.organization.location);
  }

  private selectLocation(location:Location) {
    this.logger.info(this, "selectLocation", location);
    this.zone.run(() => {
      this.organization.location = location.address;
      this.locations = [];
    });
  }

  private deleteAccount(event:any) {
    let buttons = [
      {
        text: 'Delete',
        handler: () => {
          let loading = this.showLoading("Deleting...", true);
          this.api.deleteOrganization(this.organization).then((deleted:any) => {
            loading.dismiss();
            this.showToast("Your account has been deleted");
            this.hideModal({
              deleted: true
            });
          },
          (error:any) => {
            loading.dismiss();
            this.showAlert("Problem Deleting Acount", error);
          });
        }
      },
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          this.logger.info(this, "deleteAccount", "Cancelled");
        }
      }
    ];
    this.showConfirm("Delete Account", "Are you sure you want to delete your account?", buttons);
  }

}
