import { Injectable } from '@angular/core';
import { Http, Headers, URLSearchParams, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { File, Entry, Metadata } from '@ionic-native/file';
import { Transfer, TransferObject, FileUploadOptions, FileUploadResult, FileTransferError } from '@ionic-native/transfer';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/throw';

import { LoggerService } from '../providers/logger-service';

@Injectable()
export class HttpService {

  constructor(
    protected http:Http,
    protected file:File,
    protected transfer:Transfer,
    protected logger:LoggerService) {
  }

  httpHeaders(accessToken:string=null, otherHeaders:any=null): Headers {
    let headers = new Headers();
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');
    if (accessToken != null) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    if (otherHeaders) {
      for (let key of otherHeaders) {
        headers.set(key, otherHeaders[key]);
      }
    }
    return headers;
  }

  httpGet(url:string, token:string=null, params:any=null, otherHeaders:any=null) {
    return new Promise((resolve, reject) => {
      let search = new URLSearchParams();
      if (params) {
        for (let key in params) {
          search.set(key, params[key])
        }
      }
      else {
        params = "";
      }
      let headers = this.httpHeaders(token, otherHeaders);
      let options = new RequestOptions({
        headers: headers,
        search: search });
      this.logger.info(this, "GET", url, params);
      this.http.get(url, options)
        .timeout(12000)
        .map(res => res.json())
        .catch((error:any) => {
          this.logger.error(this, "GET", url, error);
          if (error instanceof Response) {
            let json:any = error.json();
            return Observable.throw(json.error || json.message || 'Request Error');
          }
          else if (error.name === "TimeoutError") {
            return Observable.throw("Request Timeout");
          }
          return Observable.throw(error || 'Request Error');
        })
        .subscribe(
          (items) => {
            this.logger.info(this, "GET", url, items);
            resolve(items);
          },
          (error) => {
            this.logger.error(this, "GET", url, error);
            reject(this.errorMessage(error));
          });
    });
  }

  httpPost(url:string, token:string=null, params:any=null, otherHeaders:any=null) {
    return new Promise((resolve, reject) => {
      let body = (params != null) ? JSON.stringify(params) : "";
      let headers = this.httpHeaders(token, otherHeaders);
      let options = new RequestOptions({
        headers: headers });
      this.logger.info(this, "POST", url, body);
      this.http.post(url, body, options)
        .timeout(12000)
        .map(res => {
          if (res.status == 204) {
            return {}
          }
          else {
            return res.json();
          }
        })
        .catch((error:any) => {
          this.logger.error(this, "POST", url, error);
          if (error instanceof Response) {
            let json:any = error.json();
            return Observable.throw(json.error || json.message || 'Request Error');
          }
          else if (error.name === "TimeoutError") {
            return Observable.throw("Request Timeout");
          }
          return Observable.throw(error || 'Request Error');
        })
        .subscribe(
          (json) => {
            this.logger.info(this, "POST", url, json);
            resolve(json);
          },
          (error) => {
            this.logger.error(this, "POST", url, params, error);
            reject(this.errorMessage(error));
          }
        );
    });
  }

  httpPut(url:string, token:string=null, params:any=null, otherHeaders:any=null) {
    return new Promise((resolve, reject) => {
      let body = JSON.stringify(params);
      let headers = this.httpHeaders(token, otherHeaders);
      let options = new RequestOptions({
        headers: headers });
      this.logger.info(this, "PUT", url, body);
      this.http.put(url, body, options)
        .timeout(12000)
        .map(res => {
          if (res.status == 204) {
            return {}
          }
          else {
            return res.json();
          }
        })
        .catch((error:any) => {
          this.logger.error(this, "PUT", url, error);
          if (error instanceof Response) {
            let json:any = error.json();
            return Observable.throw(json.error || json.message || 'Request Error');
          }
          else if (error.name === "TimeoutError") {
            return Observable.throw("Request Timeout");
          }
          return Observable.throw(error || 'Request Error');
        })
        .subscribe(
          (json) => {
            this.logger.info(this, "PUT", url, json);
            resolve(json);
          },
          (error) => {
            this.logger.error(this, "PUT", url, error);
            reject(this.errorMessage(error));
          }
        );
    });
  }

  httpPatch(url:string, token:string=null, params:any=null, otherHeaders:any=null) {
    return new Promise((resolve, reject) => {
      let body = JSON.stringify(params);
      let headers = this.httpHeaders(token, otherHeaders);
      let options = new RequestOptions({
        headers: headers });
      this.logger.info(this, "PATCH", url, body);
      this.http.patch(url, body, options)
        .timeout(12000)
        .map(res => {
          if (res.status == 204) {
            return {}
          }
          else {
            return res.json();
          }
        })
        .catch((error:any) => {
          this.logger.error(this, "PATCH", url, error);
          if (error instanceof Response) {
            let json:any = error.json();
            return Observable.throw(json.error || json.message || 'Request Error');
          }
          else if (error.name === "TimeoutError") {
            return Observable.throw("Request Timeout");
          }
          return Observable.throw(error || 'Request Error');
        })
        .subscribe(
          (json) => {
            this.logger.info(this, "PATCH", url, json);
            resolve(json);
          },
          (error) => {
            this.logger.error(this, "PATCH", url, error);
            reject(this.errorMessage(error));
          }
        );
    });
  }

  httpDelete(url:string, token:string=null, otherHeaders:any=null) {
    return new Promise((resolve, reject) => {
      let headers = this.httpHeaders(token, otherHeaders);
      let options = new RequestOptions({
        headers: headers });
      this.logger.info(this, "DELETE", url);
      this.http.delete(url, options)
        .timeout(12000)
        .map(res => {
          this.logger.info(this, "DELETE", url, res);
          if (res.status == 201) {
            return res.headers.toJSON();
          }
          else if (res.status == 204) {
            return res.headers.toJSON();
          }
          else {
            return res.json();
          }
        })
        .catch((error:any) => {
          this.logger.error(this, "DELETE", url, error);
          if (error instanceof Response) {
            let json:any = error.json();
            return Observable.throw(json.error || json.message || 'Request Error');
          }
          else if (error.name === "TimeoutError") {
            return Observable.throw("Request Timeout");
          }
          return Observable.throw(error || 'Request Error');
        })
        .subscribe(
          (items) => {
            this.logger.info(this, "DELETE", url, items);
            resolve(items);
          },
          (error) => {
            this.logger.error(this, "DELETE", url, error);
            reject(this.errorMessage(error));
          });
    });
  }

  fileUpload(url:string, token:string, file:string, caption:string,
             httpMethod:string="POST",
             mimeType:string='application/binary',
             acceptType:string="application/json",
             contentType:string=undefined,
             contentLength:number=null) {
    return new Promise((resolve, reject) => {
      let fileName = file.substr(file.lastIndexOf('/') + 1).split('?').shift();
      let headers = {};
      if (acceptType) {
        headers['Accept'] = acceptType;
      }
      if (contentType) {
        headers['Content-Type'] = contentType;
      }
      if (contentLength) {
        headers['Content-Length'] = contentLength;
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      var params = {};
      if (caption && caption.length > 0) {
        params['caption'] = caption;
      }
      var options:FileUploadOptions = {
        httpMethod: httpMethod,
        mimeType: mimeType,
        fileName: fileName,
        headers: headers,
        params: params
      };
      this.logger.info(this, "UPLOAD", url, file, options);
      let fileTransfer:TransferObject = this.transfer.create();
      fileTransfer.upload(file, url, options, true).then(
        (data:FileUploadResult) => {
          this.logger.info(this, "UPLOAD", url, file, data);
          resolve(data);
        },
        (error:FileTransferError) => {
          this.logger.error(this, "UPLOAD", url, file,
            "Code", error.code,
            "Source", error.source,
            "Target", error.target,
            "Body", error.body,
            "Exception", error.exception);
          reject(error.body || error.exception);
       });
    });
  }

  mimeType(file:string):string {
    let extension = file.toLowerCase().substr(file.lastIndexOf('.')+1);
    if (extension == "mov") {
      return "video/quicktime";
    }
    else if (extension == "avi") {
      return "video/avi";
    }
    else if (extension == "mp4") {
      return "video/mp4";
    }
    else if (extension == "jpg") {
      return "image/jpeg";
    }
    else if (extension == "jpeg") {
      return "image/jpeg";
    }
    else if (extension == "png") {
      return "image/png";
    }
    return "application/binary"
  }

  fileSize(filePath:any):Promise<number> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "fileSize", filePath);
      this.file.resolveLocalFilesystemUrl(filePath).then(
        (entry:Entry) => {
          this.logger.info(this, "fileSize", filePath, "Entry", entry.fullPath);
          entry.getMetadata(
            (metadata:Metadata) => {
              this.logger.info(this, "fileSize", filePath, "Metadata", metadata);
              resolve(metadata.size);
            },
            (error:any) => {
              this.logger.error(this, "fileSize", filePath, "Metadata", error);
              reject(error);
            });
        },
        (error) => {
          this.logger.error(this, "fileSize", filePath, "Error", error);
          reject(error);
        });
    });
  }

  errorMessage(error:any):string {
    try {
      if (typeof error === 'string') {
        return error;
      }
      else {
        let json = error.json();
        if (json['error']) {
          return json['error'];
        }
        else if (json['message']) {
          return json['message'];
        }
        else if (json['errors']) {
          let errors = json['errors'];
          let messages = [];
          for (let _error of errors) {
            if (_error['message']) {
              messages.push(_error['message']);
            }
          }
          return messages.join(", ");
        }
      }
    }
    catch (err) {
      this.logger.error(this, "errorMessage", err);
    }
    return JSON.stringify(error);
  }

}
