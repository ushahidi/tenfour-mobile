import { IonicErrorHandler } from 'ionic-angular';
import Raven from 'raven-js';
import { Environment as ENVIRONMENT } from "@app/env";

Raven
    .config(ENVIRONMENT.sentryDSN,
            {
            release: require('../version').version,
            environment: ENVIRONMENT.environmentName,
            dataCallback: data => {
                if (data.message) {
                    data.message = data.message.replace(/"Authorization":"(.*?)"/, '"Authorization":"****"');
                    data.message = data.message.replace(/"client_secret":"(.*?)"/, '"client_secret":"****"');
                    data.message = data.message.replace(/"password":"(.*?)"/, '"password":"****"');
                    data.message = data.message.replace(/"accessToken":"(.*?)"/, '"accessToken":"****"');
                }

                if (data.fingerprint && data.fingerprint[0]) {
                    data.fingerprint[0] = data.fingerprint[0].replace(/"Authorization":"(.*?)"/, '"Authorization":"****"');
                    data.fingerprint[0] = data.fingerprint[0].replace(/"client_secret":"(.*?)"/, '"client_secret":"****"');
                    data.fingerprint[0] = data.fingerprint[0].replace(/"password":"(.*?)"/, '"password":"****"');
                    data.fingerprint[0] = data.fingerprint[0].replace(/"accessToken":"(.*?)"/, '"accessToken":"****"');
                }

                if (data.culprit) {
                    data.culprit = data.culprit.substring(data.culprit.lastIndexOf('/'));
                }

                var stacktrace = data.stacktrace ||
                                 data.exception &&
                                 data.exception.values[0].stacktrace;

                if (stacktrace) {
                    stacktrace.frames.forEach(function (frame) {
                        frame.filename = frame.filename.substring(frame.filename.lastIndexOf('/'));
                    });
                }
            }
        })
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
