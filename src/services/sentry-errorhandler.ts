import { IonicErrorHandler } from 'ionic-angular';
import Raven from 'raven-js';
import { Environment as ENVIRONMENT } from "@app/env";

Raven
    .config(ENVIRONMENT.sentryDSN,
            {
            release: ENVIRONMENT.release,
            dataCallback: data => {

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
