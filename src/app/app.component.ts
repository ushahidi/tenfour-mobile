import { Component, Injector, ViewChild } from '@angular/core';
import { Platform, Events, Nav, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { SigninUrlPage } from '../pages/signin-url/signin-url';
import { RollcallListPage } from '../pages/rollcall-list/rollcall-list';
import { GroupListPage } from '../pages/group-list/group-list';
import { PeopleListPage } from '../pages/people-list/people-list';
import { SettingsPage } from '../pages/settings/settings';

import { ApiService } from '../providers/api-service';
import { LoggerService } from '../providers/logger-service';
import { InjectorService } from '../providers/injector-service';

import { Organization } from '../models/organization';


@Component({
  templateUrl: 'app.html'
})
export class RollcallApp {

  rootPage:any = SigninUrlPage;
  organization:Organization = null;

  @ViewChild(Nav)
  nav: Nav;

  constructor(
    protected platform:Platform,
    protected injector:Injector,
    protected statusBar:StatusBar,
    protected events:Events,
    protected splashScreen:SplashScreen,
    protected api:ApiService,
    protected logger:LoggerService,
    protected menuController:MenuController) {
    InjectorService.injector = injector;
    this.platform.ready().then(() => {
      this.loadStatusBar();
      this.loadMenuEvents();
      this.hideSplashScreen();
    });
  }

  loadStatusBar() {
    this.statusBar.styleDefault();
  }

  loadMenuEvents() {
    this.events.subscribe("organization:loaded", (organization:Organization) => {
      this.logger.info(this, "Organization", organization);
      this.organization = organization;
    });
  }

  hideSplashScreen() {
    this.splashScreen.hide();
  }

  showRollcallList() {
    this.logger.info(this, "showRollcallList");
    this.nav.setRoot(RollcallListPage,
      { organization: this.organization });
    this.menuController.close();
  }

  showGroupList() {
    this.logger.info(this, "showGroupList");
    this.nav.setRoot(GroupListPage,
      { organization: this.organization });
    this.menuController.close();
  }

  showPeopleList() {
    this.logger.info(this, "showPeopleList");
    this.nav.setRoot(PeopleListPage,
      { organization: this.organization });
    this.menuController.close();
  }

  showSettings() {
    this.logger.info(this, "showSettings");
    this.nav.setRoot(SettingsPage,
      { organization: this.organization });
    this.menuController.close();
  }

}
