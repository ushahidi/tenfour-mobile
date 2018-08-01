import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { Diagnostic } from '@ionic-native/diagnostic';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { LoggerProvider } from '../../providers/logger/logger';

@Injectable()
export class CameraProvider {

  constructor(
    private platform:Platform,
    private camera:Camera,
    private diagnostic:Diagnostic,
    private logger:LoggerProvider) {

  }

  public cameraPresent():Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.diagnostic.isCameraPresent().then((cameraPresent:boolean) => {
          this.logger.info(this, "loadCamera", "isCameraPresent", cameraPresent);
          resolve(cameraPresent);
        },
        (error:any) => {
          this.logger.warn(this, "loadCamera", "isCameraPresent", error);
          resolve(false);
        });
      }
      else {
        this.logger.warn(this, "loadCamera", "isCameraPresent", "Not available");
        resolve(false);
      }
    });
  }

  public cameraRollPresent():Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        resolve(true);
      }
      else {
        resolve(false);
      }
    });
  }

  public showCamera():Promise<any> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "showCamera");
      let options:CameraOptions = {
        mediaType: this.camera.MediaType.PICTURE,
        encodingType: this.camera.EncodingType.JPEG,
        destinationType: this.camera.DestinationType.DATA_URL,
        sourceType: this.camera.PictureSourceType.CAMERA
      }
      this.camera.getPicture(options).then((imageData:any) => {
        this.logger.info(this, "showCamera", "Captured");
        if (imageData) {
          resolve('data:image/jpeg;base64,' + imageData);
        }
        else {
          resolve(null);
        }
      },
      (error:any) => {
        this.logger.error(this, "showCamera", error);
        reject(error);
      });
    });
  }

  public showCameraRoll():Promise<any> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "showCameraRoll");
      let options:CameraOptions = {
        mediaType: this.camera.MediaType.PICTURE,
        encodingType: this.camera.EncodingType.JPEG,
        destinationType: this.camera.DestinationType.DATA_URL,
        sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
      }
      this.camera.getPicture(options).then((imageData:any) => {
        this.logger.info(this, "showCameraRoll", "Selected");
        if (imageData) {
          resolve('data:image/jpeg;base64,' + imageData);
        }
        else {
          resolve(null);
        }
      },
      (error:any) => {
        this.logger.error(this, "showCameraRoll", error);
        reject(error);
      });
    });
  }

}
