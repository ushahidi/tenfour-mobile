import { IonicErrorHandler } from 'ionic-angular';
import Raven from 'raven-js';
import { Environment as ENVIRONMENT } from "@app/env";

Raven
    .config(ENVIRONMENT.sentryDSN)
    .install();

export class SentryErrorHandler extends IonicErrorHandler {

    handleError(error) {
        super.handleError(error);

        try {
          Raven.captureException(error.originalError || error);
        }
        catch(e) {
          console.error(e);
        }
    }
}
