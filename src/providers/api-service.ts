import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Transfer} from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { NativeGeocoder, NativeGeocoderForwardResult } from '@ionic-native/native-geocoder';
import { NativeStorage } from '@ionic-native/native-storage';

import { HttpService } from '../providers/http-service';
import { LoggerService } from '../providers/logger-service';
import { DatabaseService } from '../providers/database-service';

@Injectable()
export class ApiService extends HttpService {

  constructor(
    protected http:Http,
    protected file:File,
    protected transfer:Transfer,
    protected logger:LoggerService,
    protected storage:NativeStorage,
    protected database:DatabaseService) {
    super(http, file, transfer, logger);
  }

}
