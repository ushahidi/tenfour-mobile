import { Component, NgZone, Input, Output, EventEmitter } from '@angular/core';

import { Organization } from '../../models/organization';
import { Checkin } from '../../models/checkin';
import { Reply } from '../../models/reply';
import { Answer } from '../../models/answer';
import { User } from '../../models/user';
import { Location } from '../../models/location';

import { LoggerProvider } from '../../providers/logger/logger';
import { KeyboardProvider } from '../../providers/keyboard/keyboard';
import { LocationProvider } from '../../providers/location/location';

@Component({
  selector: 'checkin-respond',
  templateUrl: 'checkin-respond.html',
  providers: [ LoggerProvider, LocationProvider, KeyboardProvider ]
})
export class CheckinRespondComponent {

  @Input()
  organization:Organization;

  @Input()
  checkin:Checkin;

  @Output()
  checkinChange = new EventEmitter();

  locations:Location[] = [];
  locating:boolean = false;
  timer:any = null;

  constructor(
    private zone:NgZone,
    private logger:LoggerProvider,
    private location:LocationProvider,
    private keyboard:KeyboardProvider) {
  }

  ngOnInit() {
    if (this.checkin) {
      if (this.checkin.reply == null) {
        this.checkin.reply = new Reply();
        this.checkin.reply.checkin_id = this.checkin.id;
      }
      if (this.organization) {
        this.checkin.reply.organization_id = this.organization.id;
      }
    }
    if (this.locating == false) {
      this.locating = true;
      this.loadLocation(true).then((location:Location) => {
        this.logger.info(this, "ngOnInit", location);
        this.locating = false;
      },
      (error:any) => {
        this.logger.warn(this, "ngOnInit", error);
        this.locating = false;
      });
    }
  }

  private loadLocation(cache:boolean=true):Promise<Location> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadLocation");
      this.location.detectLocation(cache).then((location:Location) => {
        this.logger.info(this, "loadLocation", location);
        this.location.lookupAddress(location).then((address:string) => {
          this.logger.info(this, "loadLocation", address);
          location.address = address;
          if (this.checkin.reply.location_text == null) {
            this.checkin.reply.latitude = location.latitude;
            this.checkin.reply.longitude = location.longitude;
            this.checkin.reply.location_text = location.address;
          }
          resolve(location);
        },
        (error:any) => {
          this.logger.warn(this, "loadLocation", error);
          if (this.checkin.reply.location_text == null) {
            this.checkin.reply.latitude = location.latitude;
            this.checkin.reply.longitude = location.longitude;
          }
          resolve(location);
        });
      },
      (error:any) => {
        this.logger.warn(this, "loadLocation", error);
        reject(error);
      });
    });
  }

  private selectAnswer(checkin:Checkin, reply:Reply, answer:Answer) {
    this.logger.info(this, "selectAnswer", answer);
    reply.answer = answer.answer;
  }

  private removeMessage(reply:Reply) {
    this.logger.info(this, "removeMessage", reply);
    reply.message = null;
  }

  private removeLocation(reply:Reply) {
    this.logger.info(this, "removeLocation", reply);
    reply.location_text = null;
    reply.latitude = null;
    reply.longitude = null;
    this.locations = [];
  }

  private searchAddress() {
    clearTimeout(this.timer);
    this.timer = setTimeout((address:string, latitude:number, longitude:number) => {
      if (address && address.length > 0) {
        this.logger.info(this, "searchAddress", address);
        this.location.searchAddress(address, 5, latitude, longitude).then((locations:Location[]) => {
          this.logger.info(this, "searchAddress", address, locations);
          this.zone.run(() => {
            this.locations = locations;
          });
        },
        (error:any) => {
          this.logger.warn(this, "searchAddress", address, error);
          this.zone.run(() => {
            this.locations = [];
          });
        });
      }
      else {
        this.zone.run(() => {
          this.locations = [];
        });
      }
    }, 900, this.checkin.reply.location_text, this.checkin.reply.latitude, this.checkin.reply.longitude);
  }

  private selectLocation(location:Location) {
    this.logger.info(this, "selectLocation", location);
    this.location.placeDetails(location).then((_location:Location) => {
      this.logger.info(this, "selectLocation", location, "placeDetails", _location);
      if (_location && _location.latitude && _location.longitude) {
        this.checkin.reply.latitude = _location.latitude;
        this.checkin.reply.longitude = _location.longitude;
      }
    });
    this.zone.run(() => {
      this.checkin.reply.location_text = location.address;
      this.locations = [];
    });
  }

  private onKeyPress(event:any) {
    if (event && event.keyCode && event.keyCode == 13) {
      this.keyboard.hide();
      return false;
    }
    else {
      return true;
    }
  }

}
