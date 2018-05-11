import { Component, ViewChild, NgZone } from '@angular/core';
import { Content, Platform, NavParams, Alert, AlertController, Toast, ToastController, Modal, ModalController, Loading, LoadingController, ActionSheet, ActionSheetController, NavController, ViewController } from 'ionic-angular';

import { Device } from '@ionic-native/device';
import { AppVersion } from '@ionic-native/app-version';
import { SegmentService } from 'ngx-segment-analytics';

import { Network } from '@ionic-native/network';
import { Keyboard } from '@ionic-native/keyboard';
import { StatusBar } from '@ionic-native/status-bar';
import { SocialSharing } from '@ionic-native/social-sharing';
import { ThemeableBrowser, ThemeableBrowserOptions, ThemeableBrowserObject } from '@ionic-native/themeable-browser';

import { LoggerProvider } from '../../providers/logger/logger';
import { InjectorProvider } from '../../providers/injector/injector';

import { Organization } from '../../models/organization';
import { Person } from '../../models/person';

@Component({
  selector: 'base-page',
  templateUrl: 'base-page.html',
  providers: [ LoggerProvider ],
})
export class BasePage {

  protected offline:boolean = false;
  protected tablet:boolean = false;
  protected mobile:boolean = false;
  protected android:boolean = false;
  protected ios:boolean = false;
  protected web:boolean = false;

  protected connection:any = null;
  protected disconnection:any = null;

  protected zone:NgZone;
  protected logger:LoggerProvider;
  protected network:Network;
  protected keyboard:Keyboard;
  protected statusBar:StatusBar;
  protected themeableBrowser:ThemeableBrowser;
  protected socialSharing:SocialSharing;
  protected segment:SegmentService;
  protected device:Device;
  protected appVersion:AppVersion;

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
    this.logger = InjectorProvider.injector.get(LoggerProvider);
    this.network = InjectorProvider.injector.get(Network);
    this.keyboard = InjectorProvider.injector.get(Keyboard);
    this.statusBar = InjectorProvider.injector.get(StatusBar);
    this.themeableBrowser = InjectorProvider.injector.get(ThemeableBrowser);
    this.socialSharing = InjectorProvider.injector.get(SocialSharing);
    this.segment = InjectorProvider.injector.get(SegmentService);
    this.device = InjectorProvider.injector.get(Device);
    this.appVersion = InjectorProvider.injector.get(AppVersion)
  }

  ionViewDidLoad() {
    this.logger.info(this, "ionViewDidLoad");
    this.platform.ready().then(() => {
      this.ios = this.platform.is('ios');
      this.android = this.platform.is('android');
      this.tablet = this.platform.is('tablet');
      this.mobile = this.platform.is('cordova');
      this.web = this.platform.is('core');
    })
  }

  ionViewWillEnter() {
    this.logger.info(this, "ionViewWillEnter");
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

  protected subscribeNetwork() {
    if (this.mobile) {
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
  }

  protected unsubscribeNetwork() {
    if (this.mobile) {
      this.logger.info(this, "unsubscribeNetwork", "Network", this.network.type);
      if (this.connection) {
        this.connection.unsubscribe();
        this.connection = null;
      }
      if (this.disconnection) {
        this.disconnection.unsubscribe();
        this.disconnection = null;
      }
    };
  }

  protected loadStatusBar(lightContent:boolean=true) {
    this.platform.ready().then(() => {
      if (this.mobile) {
        if (lightContent) {
          this.statusBar.styleLightContent();
          this.statusBar.backgroundColorByHexString('#3f4751');
        }
        else {
          this.statusBar.styleDefault();
          this.statusBar.backgroundColorByHexString('#f9f9f8');
        }
      }
    });
  }

  protected getParameter<T extends Object>(param:string):T {
    return <T>this.navParams.get(param);
  }

  protected showLoading(message:string):Loading {
    let loading = this.loadingController.create({
      content: message
    });
    loading.present();
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
    let modal = this.modalController.create(page, params, options);
    modal.present();
    return modal;
  }

  protected hideModal(data:any=null, options:any={}) {
    return this.viewController.dismiss(data, options);
  }

  protected showPage(page:any, params:any={}, options:any={}) {
    return this.navController.push(page, params, options);
  }

  protected showRootPage(page:any, params:any={}, options:any={}) {
    return this.navController.setRoot(page, params, options);
  }

  protected closePage(data:any=null, options:any={}) {
    return this.viewController.dismiss(data, options);
  }

  protected showShare(subject:string, message:string=null, file:string=null, url:string=null) {
    return this.socialSharing.share(message, subject, file, url);
  }

  protected showUrl(url:string, target:string="_blank", event:any=null):any {
    this.logger.info(this, "showUrl", url, target);
    if (this.mobile) {
      let options:ThemeableBrowserOptions = {
        statusbar: {
          color: "f5f5f1"
        },
          toolbar: {
          height: 44,
          color: "f5f5f1"
        },
          title: {
          color: '#000000',
          showPageTitle: true
        },
        backButton: {
          wwwImage: 'assets/images/back.png',
          wwwImageDensity: 2,
          align: 'right',
          event: 'backPressed'
        },
        forwardButton: {
          wwwImage: 'assets/images/forward.png',
          wwwImageDensity: 2,
          align: 'right',
          event: 'forwardPressed'
        },
        closeButton: {
          wwwImage: 'assets/images/close.png',
          wwwImageDensity: 2,
          align: 'left',
          event: 'closePressed'
        },
        backButtonCanClose: true
      };
      let browser = this.themeableBrowser.create(url, target, options);
      if (this.platform.is("ios")) {
        browser.show();
      }
      if (event) {
        event.stopPropagation();
      }
      return browser;
    }
    else {
      window.open(url, target);
      return null;
    }
  }

  protected showOfflineAlert() {
    this.showAlert("Internet Offline", "There currently is no internet connection available.")
  }

  protected resizeContent(delay:number=100) {
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

  protected showKeyboard() {
    if (this.mobile) {
      this.keyboard.show();
    }
  }

  protected hideKeyboard() {
    if (this.mobile) {
      this.keyboard.close();
    }
  }

  protected trackLogin(organization:Organization, person:Person) {
    if (organization && person) {
      this.trackIdentify(person.id, {
        app: this.appName(),
        device: this.deviceName(),
        organization: organization.name,
        person: person.name,
        email: organization.email
      });
    }
  }

  protected trackIdentify(user:any, traits:any=null) {
    return this.segment.identify("" + user, traits).then(() => {
      this.logger.info(this, "Segment", "trackIdentify", user, traits);
    });
  }

  protected trackPage(properties:any=null) {
    let name = this.pageName();
    return this.segment.page(name, properties).then(() => {
      this.logger.info(this, "Segment", "trackPage", name, properties);
    });
  }

  protected trackEvent(event:string, properties:any=null) {
    return this.segment.track(event, properties).then(() => {
      this.logger.info(this, "Segment", "trackEvent", event);
    });
  }

  protected appName():string {
    if (this.mobile) {
      return `${this.appVersion.getAppName()} ${this.appVersion.getVersionNumber()}`;
    }
    return "TenFour";
  }

  protected deviceName():string {
    let name = [];
    if (this.mobile) {
      if (this.device.manufacturer) {
        name.push(this.device.manufacturer);
      }
      if (this.device.platform) {
        name.push(this.device.platform);
      }
      if (this.device.version) {
        name.push(this.device.version);
      }
      if (this.device.model) {
        name.push(this.device.model);
      }
    }
    else {
      name.push(navigator.appVersion);
    }
    return name.join(" ");
  }

  protected pageName():string {
    return this.constructor.name
      .replace('Page', '')
      .replace(/([A-Z])/g, function(match) {
        return " " + match;
      })
      .replace(/^./, function(match) {
        return match.toUpperCase();
      })
      .trim();
  }

}
