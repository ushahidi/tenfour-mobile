import { Component, ViewChild, NgZone } from '@angular/core';
import { App, Content, Events, Platform, NavParams, Alert, AlertController, Toast, ToastController, Modal, ModalController, Loading, LoadingController, ActionSheet, ActionSheetController, NavController, ViewController } from 'ionic-angular';

import { LoggerProvider } from '../../providers/logger/logger';
import { BrowserProvider } from '../../providers/browser/browser';
import { NetworkProvider } from '../../providers/network/network';
import { SharingProvider } from '../../providers/sharing/sharing';
import { KeyboardProvider } from '../../providers/keyboard/keyboard';
import { InjectorProvider } from '../../providers/injector/injector';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { IntercomProvider } from '../../providers/intercom/intercom';
import { StatusBarProvider } from '../../providers/status-bar/status-bar';

@Component({
  selector: 'base-page',
  template: "<ion-header></ion-header><ion-content></ion-content>",
  providers: [ LoggerProvider ]
})
export class BasePage {

  protected readonly WIDTH_SMALL:number = 540;
  protected readonly WIDTH_MEDIUM:number = 720;
  protected readonly WIDTH_LARGE:number = 960;
  protected readonly WIDTH_EXTRA_LARGE:number = 1140;
  protected readonly KEYCODE_RETURN:number = 13;

  protected offline:boolean = false;
  protected tablet:boolean = false;
  protected mobile:boolean = false;
  protected phone:boolean = false;
  protected android:boolean = false;
  protected ios:boolean = false;
  protected website:boolean = false;
  protected desktop:boolean = false;
  protected modal:boolean = false;

  protected app:App;
  protected zone:NgZone;
  protected events:Events;

  protected statusBar:StatusBarProvider;
  protected keyboard:KeyboardProvider;
  protected logger:LoggerProvider;
  protected network:NetworkProvider;
  protected analytics:AnalyticsProvider;
  protected intercom:IntercomProvider;
  protected browser:BrowserProvider;
  protected sharing:SharingProvider;

  @ViewChild(Content)
  content:Content;

  constructor(
    protected _zone:NgZone,
    protected platform:Platform,
    protected navParams:NavParams,
    protected navController:NavController,
    protected viewController:ViewController,
    protected modalController:ModalController,
    protected toastController:ToastController,
    protected alertController:AlertController,
    protected loadingController:LoadingController,
    protected actionController:ActionSheetController) {
    this.zone = _zone;
    this.app = InjectorProvider.injector.get(App);
    this.logger = InjectorProvider.injector.get(LoggerProvider);
    this.network = InjectorProvider.injector.get(NetworkProvider);
    this.keyboard = InjectorProvider.injector.get(KeyboardProvider);
    this.statusBar = InjectorProvider.injector.get(StatusBarProvider);
    this.analytics = InjectorProvider.injector.get(AnalyticsProvider);
    this.intercom = InjectorProvider.injector.get(IntercomProvider);
    this.browser = InjectorProvider.injector.get(BrowserProvider);
    this.sharing = InjectorProvider.injector.get(SharingProvider);
    this.events = InjectorProvider.injector.get(Events);
  }

  ionViewDidLoad() {
    this.logger.info(this, "ionViewDidLoad");
    this.platform.ready().then(() => {
      this.ios = this.platform.is('ios');
      this.android = this.platform.is('android');
      this.tablet = this.platform.is('tablet');
      this.mobile = this.platform.is('cordova');
      this.desktop = this.platform.is('core');
      this.phone = this.platform.is('cordova') && this.platform.is('tablet') == false;
      this.website = this.platform.is('mobileweb') || this.platform.is('cordova') == false;
      this.modal = this.getParameter<boolean>("modal");
    })
  }

  ionViewWillEnter() {
    this.logger.info(this, "ionViewWillEnter");
    this.network.onChanged().subscribe((connected:boolean) => {
      this.offline = connected == false;
    });
  }

  ionViewDidEnter() {
    this.logger.info(this, "ionViewDidEnter");
  }

  ionViewWillLeave() {
    this.logger.info(this, "ionViewWillLeave");
  }

  ionViewDidLeave() {
    this.logger.info(this, "ionViewDidLeave");
  }

  ionViewWillUnload() {
    this.logger.info(this, "ionViewWillUnload");
  }

  protected hasParameter(param:string):boolean {
    if (this.platform.getQueryParam(param) != null) {
      return true;
    }
    return this.navParams.get(param) != null;
  }

  protected getParameter<T extends Object>(param:string):T {
    if (this.platform.getQueryParam(param) != null) {
      return <T>this.platform.getQueryParam(param);
    }
    return <T>this.navParams.get(param);
  }

  protected showLoading(message:string="Loading...", important:boolean=false):Loading {
    let loading = this.loadingController.create({
      content: message
    });
    if (important || this.mobile) {
      loading.present();
    }
    return loading;
  }

  protected showToast(message:string, duration:number=3000):Toast {
    let toast = this.toastController.create({
      message: message,
      duration: duration
    });
    toast.present();
    return toast;
  }

  protected showAlert(title:string, subTitle:string, buttons:any=['OK']):Alert {
    let alert = this.alertController.create({
      title: title,
      subTitle: subTitle,
      buttons: buttons
    });
    alert.present();
    return alert;
  }

  protected showConfirm(title:string, subTitle:string, buttons:any=['OK']):Alert {
    let alert = this.alertController.create({
      title: title,
      subTitle: subTitle,
      buttons: buttons
    });
    alert.present();
    return alert;
  }

  protected showActionSheet(title:string, buttons:any):ActionSheet {
    let actionSheet = this.actionController.create({
      title: title,
      buttons: buttons
    });
    actionSheet.present();
    return actionSheet;
  }

  protected showModal(page:any, params:any={}, options:any={}):Modal {
    if (params) {
      params['modal'] = true;
    }
    let modal = this.modalController.create(page, params, options);
    modal.present();
    return modal;
  }

  protected hideModal(data:any=null, options:any={}):Promise<any> {
    return this.viewController.dismiss(data, options);
  }

  protected hideModals():Promise<boolean> {
    return new Promise((resolve, reject) => {
      let modals = this.navController.getViews().filter((view:ViewController) => view.isOverlay);
      let dismisses = [];
      for (let modal of modals) {
        dismisses.push(modal.dismiss());
      }
      Promise.all(dismisses).then(() => {
        this.logger.info(this, "hideModals", "Done");
        resolve(true);
      },
      (error:any) => {
        this.logger.warn(this, "hideModals", error);
        resolve(false);
      });
    });
  }

  protected showPage(page:any, params:any={}, options:any={}):Promise<any> {
    if (params) {
      params['modal'] = false;
    }
    return this.navController.push(page, params, options);
  }

  protected showRootPage(page:any, params:any={}, options:any={}):Promise<any> {
    if (this.viewController.isOverlay) {
      return this.app.getRootNav().setRoot(page, params, options);
    }
    else {
      return this.navController.setRoot(page, params, options);
    }
  }

  protected closePage(data:any=null, options:any={}):Promise<any> {
    if (this.navController.getViews().length > 1) {
      return this.viewController.dismiss(data, options);
    }
    return Promise.resolve();
  }

  protected showModalOrPage(page:any, params:any={}, options:any={}):any {
    if (document.body.clientWidth > this.WIDTH_LARGE) {
      return this.showModal(page, params, options);
    }
    else {
      return this.showPage(page, params, options);
    }
  }

  protected showShare(subject:string, message:string=null, file:string=null, url:string=null):Promise<any> {
    return this.sharing.share(subject, message, file, url);
  }

  protected showOfflineAlert():Alert {
    return this.showAlert("Internet Offline", "There currently is no internet connection available.")
  }

  protected showUrl(url:string, target:string="_blank", event:any=null):any {
    this.browser.open(url, target, event);
  }

  protected showKeyboard(event:any=null) {
    this.keyboard.show();
  }

  protected hideKeyboard(event:any=null) {
    this.keyboard.hide();
  }

  protected resizeContent(delay:number=100) {
    setTimeout(() => {
      if (this.content) {
        this.logger.info(this, "resizeContent");
        this.content.resize();
      }
      else {
        this.logger.warn(this, "resizeContent", "NULL");
      }
    }, delay);
  }

  protected promiseFallback(cache:boolean, promise1:Promise<any>, promise2:Promise<any>, minimum:number=null):Promise<any> {
    return new Promise((resolve, reject) => {
      if (cache && this.mobile) {
        promise1.then((results1:any) => {
          if (results1 && (minimum == null || results1.length >= minimum)) {
            resolve(results1);
          }
          else {
            promise2.then((results2:any) => {
              resolve(results2);
            },
            (error2:any) => {
              reject(error2);
            });
          }
        },
        (error1:any) => {
          promise2.then((results2:any) => {
            resolve(results2);
          },
          (error2:any) => {
            reject(error2);
          });
        });
      }
      else {
        promise2.then((results2:any) => {
          resolve(results2);
        },
        (error2:any) => {
          reject(error2);
        });
      }
    });
  }

  protected promiseTimeout(promise:Promise<any>, milliseconds:number=1000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject("Promise Timeout");
      }, milliseconds);
      promise.then((result:any) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error:any) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  }

  protected isKeyReturn(event:any):boolean {
    if (event && event.keyCode && event.keyCode == this.KEYCODE_RETURN) {
      return true;
    }
    return false;
  }

}
