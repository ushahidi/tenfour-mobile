import { Component, ViewChild, NgZone } from '@angular/core';
import { Content, Platform, NavParams, Alert, AlertController, Toast, ToastController, Modal, ModalController, Loading, LoadingController, ActionSheet, ActionSheetController, NavController, ViewController } from 'ionic-angular';

import { Network } from '@ionic-native/network';
import { StatusBar } from '@ionic-native/status-bar';
import { SocialSharing } from '@ionic-native/social-sharing';
import { InAppBrowser, InAppBrowserObject } from '@ionic-native/in-app-browser';

import { LoggerService } from '../../providers/logger-service';
import { InjectorService } from '../../providers/injector-service';

@Component({
  selector: 'base-page',
  templateUrl: 'base-page.html',
  providers: [ LoggerService ],
})
export class BasePage {

  protected offline:boolean = false;
  protected connection:any = null;
  protected disconnection:any = null;

  protected zone:NgZone;
  protected logger:LoggerService;
  protected network:Network;
  protected statusBar:StatusBar;
  protected inAppBrowser:InAppBrowser;
  protected socialSharing:SocialSharing;

  @ViewChild(Content)
  content: Content;

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
    this.logger = InjectorService.injector.get(LoggerService);
    this.network = InjectorService.injector.get(Network);
    this.statusBar = InjectorService.injector.get(StatusBar);
    this.inAppBrowser = InjectorService.injector.get(InAppBrowser);
    this.socialSharing = InjectorService.injector.get(SocialSharing);
  }

  ionViewDidLoad() {
    this.logger.info(this, "ionViewDidLoad");
  }

  ionViewWillEnter() {
    this.logger.info(this, "ionViewWillEnter", "Network", this.network.type);
    this.subscribeNetwork();
  }

  ionViewDidEnter() {
    this.logger.info(this, "ionViewDidEnter");
  }

  ionViewWillLeave() {
    this.logger.info(this, "ionViewWillLeave");
    this.unsubscribeNetwork();
  }

  ionViewDidLeave() {
    this.logger.info(this, "ionViewDidLeave");
  }

  ionViewWillUnload() {
    this.logger.info(this, "ionViewWillUnload");
  }

  subscribeNetwork() {
    this.logger.info(this, "subscribeNetwork", "Network", this.network.type);
    if (this.network.type == 'none') {
      this.zone.run(() => {
        this.offline = true;
        this.resizeContent();
      });
    }
    else {
      this.zone.run(() => {
        this.offline = false;
      });
    }
    this.connection = this.network.onConnect().subscribe(() => {
      this.logger.info(this, "subscribeNetwork", "Network Connected", this.network.type);
      this.zone.run(() => {
        this.offline = false;
        this.resizeContent();
      });
    });
    this.disconnection = this.network.onDisconnect().subscribe(() => {
      this.logger.info(this, "subscribeNetwork", "Network Disconnected", this.network.type);
      this.zone.run(() => {
        this.offline = true;
        this.resizeContent();
      });
    });
  }

  unsubscribeNetwork() {
    this.logger.info(this, "unsubscribeNetwork", "Network", this.network.type);
    if (this.connection) {
      this.connection.unsubscribe();
      this.connection = null;
    }
    if (this.disconnection) {
      this.disconnection.unsubscribe();
      this.disconnection = null;
    }
  }

  loadStatusBar(lightContent:boolean=true) {
    this.platform.ready().then(() => {
      if (lightContent) {
        this.statusBar.styleLightContent();
        this.statusBar.backgroundColorByHexString('#3f4751');
      }
      else {
        this.statusBar.styleDefault();
        this.statusBar.backgroundColorByHexString('#f9f9f8');
      }
    });
  }

  getParameter<T extends Object>(param:string):T {
    return <T>this.navParams.get(param);
  }

  showLoading(message:string):Loading {
    let loading = this.loadingController.create({
      content: message
    });
    loading.present();
    return loading;
  }

  showToast(message:string, duration:number=1500):Toast {
    let toast = this.toastController.create({
      message: message,
      duration: duration
    });
    toast.present();
    return toast;
  }

  showAlert(title:string, subTitle:string, buttons:any=['OK']):Alert {
    let alert = this.alertController.create({
      title: title,
      subTitle: subTitle,
      buttons: buttons
    });
    alert.present();
    return alert;
  }

  showConfirm(title:string, subTitle:string, buttons:any=['OK']):Alert {
    let alert = this.alertController.create({
      title: title,
      subTitle: subTitle,
      buttons: buttons
    });
    alert.present();
    return alert;
  }

  showActionSheet(title:string, buttons:any):ActionSheet {
    let actionSheet = this.actionController.create({
      title: title,
      buttons: buttons
    });
    actionSheet.present();
    return actionSheet;
  }

  showModal(page:any, params:any={}, options:any={}):Modal {
    let modal = this.modalController.create(page, params, options);
    modal.present();
    return modal;
  }

  hideModal(data:any=null, options:any={}) {
    return this.viewController.dismiss(data, options);
  }

  showPage(page:any, params:any={}, options:any={}) {
    return this.navController.push(page, params, options);
  }

  showRootPage(page:any, params:any={}, options:any={}) {
    return this.navController.setRoot(page, params, options);
  }

  closePage(data:any=null, options:any={}) {
    return this.viewController.dismiss(data, options);
  }

  showShare(subject:string, message:string=null, file:string=null, url:string=null) {
    return this.socialSharing.share(message, subject, file, url);
  }

  showUrl(url:string, target:string="_system"):InAppBrowserObject {
    this.logger.info(this, "showUrl", url, target);
    let browser = this.inAppBrowser.create(url, target);
    browser.show();
    return browser;
  }

  showOfflineAlert() {
    this.showAlert("Internet Offline", "There currently is no internet connection available.")
  }

  resizeContent(delay:number=100) {
    setTimeout(() => {
      if (this.content) {
        this.logger.info(this, "resizeContent");
        this.content.resize();
      }
      else {
        this.logger.error(this, "resizeContent", "NULL");
      }
    }, delay);
  }

}
