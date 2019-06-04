import { Injectable, ErrorHandler, isDevMode } from '@angular/core';
import { Platform, IonicErrorHandler } from 'ionic-angular';

import * as WebSentry from '@sentry/browser';
import * as NativeSentry from 'sentry-cordova';

import { Environment as ENVIRONMENT } from "@app/env";

@Injectable()
export class SentryErrorHandler extends IonicErrorHandler implements ErrorHandler {
  constructor(private platform:Platform) {
    super();
    this.platform.ready().then(() => {
      if (ENVIRONMENT.sentryDSN == null || ENVIRONMENT.sentryDSN.length == 0) {
        // skip loading Sentry
      }
      else if (this.platform.is("cordova")) {
        NativeSentry.init({ dsn: ENVIRONMENT.sentryDSN });
      }
      else {
        WebSentry.init({ dsn: ENVIRONMENT.sentryDSN });
      }
    });
  }

  handleError(error) {
    super.handleError(error);
    try {
      if (isDevMode) {
        console.error(error);
      }
      else if (ENVIRONMENT.sentryDSN == null || ENVIRONMENT.sentryDSN.length == 0) {
        console.error(error);
      }
      else if (this.platform.is("cordova")) {
        NativeSentry.captureException(error.originalError || error);
      }
      else {
        WebSentry.captureException(error.originalError || error);
      }
    }
    catch(e) {
      console.error(e);
    }
  }
}
