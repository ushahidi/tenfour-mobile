import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { SocialSharing } from '@ionic-native/social-sharing';

import { LoggerProvider } from '../../providers/logger/logger';

@Injectable()
export class SharingProvider {

  constructor(
    private platform:Platform,
    private socialSharing:SocialSharing,
    private logger:LoggerProvider) {
  }

  public share(subject:string, message:string=null, file:string=null, url:string=null) {
    if (this.platform.is("cordova")) {
      return this.socialSharing.share(message, subject, file, url);
    }
    else {
      // TODO add sharing option for the web
    }
  }

  public sendEmail(email:string, message:string='', subject:string='') {
    if (this.platform.is("cordova")) {
      this.socialSharing.canShareViaEmail().then(() => {
        this.socialSharing.shareViaEmail(message, subject, [email])
        .then(() => {
          this.logger.info(this, "emailContact", email, "Emailed");
        })
        .catch(() => {
          this.logger.error(this, "emailContact", "Error");
        });
      }).catch(() => {
        this.logger.error(this, "emailContact", "Error");
      });
    }
    else {
      window.open("mailto:" + email, '_blank');
    }
  }

}
