import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Http, Headers, URLSearchParams, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/throw';

import { HTTP } from '@ionic-native/http';
import { File, Entry, Metadata } from '@ionic-native/file';
import { FileTransfer, FileTransferObject, FileUploadOptions, FileUploadResult, FileTransferError } from '@ionic-native/file-transfer';

import { LoggerProvider } from '../logger/logger';

@Injectable()
export class HttpProvider {

  constructor(
    protected platform:Platform,
    protected http:Http,
    protected httpNative:HTTP,
    protected file:File,
    protected transfer:FileTransfer,
    protected logger:LoggerProvider) {
  }

  private httpHeaders(accessToken:string=null, contentType:string=null):{} {
    let headers = {
      Accept: "application/json"
    };
    if (accessToken && accessToken.length > 0) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    if (contentType && contentType.length > 0) {
      headers["Content-Type"] = contentType;
    }
    return headers;
  }

  protected httpGet(url:string, params:any={}, token:string=null):Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        let headers = this.httpHeaders(token);
        this.logger.info(this, "GET", url, params, headers);
        this.httpNative.setRequestTimeout(30);
        this.httpNative.setDataSerializer("json");
        this.httpNative.get(url, params, headers).then((response:any) => {
          if (response.data) {
            if (response.headers['content-type'].indexOf("application/json") != -1) {
              let data = JSON.parse(response.data);
              this.logger.info(this, "GET", url, response.status, data);
              resolve(data);
            }
            else {
              this.logger.info(this, "GET", url, response.status, response.data);
              resolve(response.data);
            }
          }
          else {
            this.logger.error(this, "GET", url, response.status, "No Data");
            reject("No Response Data");
          }
        },
        (error:any) => {
          this.logger.error(this, "GET", url, error.status, error.error);
          reject(this.httpError(error));
        });
      }
      else {
        let search = new URLSearchParams();
        if (params) {
          for (let key in params) {
            search.set(key, params[key])
          }
        }
        else {
          params = "";
        }
        let headers = new Headers(this.httpHeaders(token));
        let options = new RequestOptions({
          headers: headers,
          search: search });
        this.logger.info(this, "GET", url, params);
        this.http.get(url, options)
          .timeout(12000)
          .map(res => res.json())
          .catch((error:any) => {
            this.logger.error(this, "httpGet", error);
            let message = this.httpError(error);
            return Observable.throw(message || 'Request Error');
          })
          .subscribe(
            (items) => {
              this.logger.info(this, "GET", url, items);
              resolve(items);
            },
            (error) => {
              this.logger.error(this, "GET", url, error);
              reject(this.httpError(error));
            });
      }
    });
  }

  protected httpPost(url:string, params:any={}, token:string=null):Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        let headers = this.httpHeaders(token, "application/json");
        this.logger.info(this, "POST", url, params, headers);
        this.httpNative.setRequestTimeout(30);
        this.httpNative.setDataSerializer("json");
        this.httpNative.post(url, params, headers).then((response:any) => {
          if (response.data) {
            this.logger.info(this, "POST", url, response.status, response.headers, response.data);
            if (response.headers['content-type'].indexOf("application/json") != -1) {
              let data = JSON.parse(response.data);
              this.logger.info(this, "POST", url, response.status, data);
              resolve(data);
            }
            else {
              this.logger.info(this, "POST", url, response.status, response.data);
              resolve(response.data);
            }
          }
          else {
            this.logger.error(this, "POST", url, response.status, "No Data");
            reject("No Response Data");
          }
        },
        (error:any) => {
          this.logger.error(this, "POST", url, error.status, error.error);
          reject(this.httpError(error));
        });
      }
      else {
        let headers = new Headers(this.httpHeaders(token));
        let options = new RequestOptions({
          headers: headers
        });
        this.logger.info(this, "POST", url, params);
        this.http.post(url, params, options)
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
            let message = this.httpError(error);
            return Observable.throw(message || 'Request Error');
          })
          .subscribe(
            (json) => {
              this.logger.info(this, "POST", url, json);
              resolve(json);
            },
            (error) => {
              this.logger.error(this, "POST", url, error);
              reject(this.httpError(error));
            }
          );
      }
    });
  }

  protected httpPut(url:string, params:any={}, token:string=null):Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        let headers = this.httpHeaders(token, "application/json");
        this.logger.info(this, "PUT", url, params, headers);
        this.httpNative.setRequestTimeout(30);
        this.httpNative.setDataSerializer("json");
        this.httpNative.put(url, params, headers).then((response:any) => {
          if (response.data) {
            if (response.headers['content-type'].indexOf("application/json") != -1) {
              let data = JSON.parse(response.data);
              this.logger.info(this, "PUT", url, response.status, data);
              resolve(data);
            }
            else {
              this.logger.info(this, "PUT", url, response.status, response.data);
              resolve(response.data);
            }
          }
          else {
            this.logger.error(this, "PUT", url, response.status, "No Data");
            reject("No Response Data");
          }
        },
        (error:any) => {
          this.logger.error(this, "PUT", url, error.status, error.error);
          reject(this.httpError(error));
        });
      }
      else {
        let headers = new Headers(this.httpHeaders(token));
        let options = new RequestOptions({
          headers: headers
        });
        this.logger.info(this, "PUT", url, params);
        this.http.put(url, params, options)
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
            let message = this.httpError(error);
            return Observable.throw(message || 'Request Error');
          })
          .subscribe(
            (json) => {
              this.logger.info(this, "PUT", url, json);
              resolve(json);
            },
            (error) => {
              this.logger.error(this, "PUT", url, error);
              reject(this.httpError(error));
            }
          );
      }
    });
  }

  protected httpPatch(url:string, params:any={}, token:string=null):Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        let headers = this.httpHeaders(token, "application/json");
        this.logger.info(this, "PATCH", url, params, headers);
        this.httpNative.setRequestTimeout(30);
        this.httpNative.setDataSerializer("json");
        this.httpNative.patch(url, params, headers).then((response:any) => {
          if (response.data) {
            if (response.headers['content-type'].indexOf("application/json") != -1) {
              let data = JSON.parse(response.data);
              this.logger.info(this, "PATCH", url, response.status, data);
              resolve(data);
            }
            else {
              this.logger.info(this, "PATCH", url, response.status, response.data);
              resolve(response.data);
            }
          }
          else {
            this.logger.error(this, "PATCH", url, response.status, "No Data");
            reject("No Response Data");
          }
        },
        (error:any) => {
          this.logger.error(this, "PATCH", url, error.status, error.error);
          reject(this.httpError(error));
        });
      }
      else {
        let headers = new Headers(this.httpHeaders(token));
        let options = new RequestOptions({
          headers: headers
        });
        this.logger.info(this, "PATCH", url, params);
        this.http.patch(url, params, options)
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
            let message = this.httpError(error);
            return Observable.throw(message || 'Request Error');
          })
          .subscribe(
            (json) => {
              this.logger.info(this, "PATCH", url, json);
              resolve(json);
            },
            (error) => {
              this.logger.error(this, "PATCH", url, error);
              reject(this.httpError(error));
            }
          );
      }
    });
  }

  protected httpDelete(url:string, params:any={}, token:string=null):Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        let headers = this.httpHeaders(token);
        this.logger.info(this, "DELETE", url, params, headers);
        this.httpNative.setRequestTimeout(30);
        this.httpNative.setDataSerializer("json");
        this.httpNative.delete(url, params, headers).then((response:any) => {
          if (response.data) {
            if (response.headers['content-type'].indexOf("application/json") != -1) {
              let data = JSON.parse(response.data);
              this.logger.info(this, "DELETE", url, response.status, data);
              resolve(data);
            }
            else {
              this.logger.info(this, "DELETE", url, response.status, response.data);
              resolve(response.data);
            }
          }
          else {
            this.logger.error(this, "DELETE", url, response.status, "No Data");
            reject("No Response Data");
          }
        },
        (error:any) => {
          this.logger.error(this, "DELETE", url, error.status, error.error);
          reject(this.httpError(error));
        });
      }
      else {
        let headers = new Headers(this.httpHeaders(token));
        let options = new RequestOptions({
          headers: headers
        });
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
            let message = this.httpError(error);
            return Observable.throw(message || 'Request Error');
          })
          .subscribe(
            (items) => {
              this.logger.info(this, "DELETE", url, items);
              resolve(items);
            },
            (error) => {
              this.logger.error(this, "DELETE", url, error);
              reject(this.httpError(error));
            });
      }
    });
  }

  protected fileUpload(url:string, token:string, file:string, caption:string,
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
      let fileTransfer:FileTransferObject = this.transfer.create();
      fileTransfer.upload(file, url, options, true).then((data:FileUploadResult) => {
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

  protected mimeType(file:string):string {
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

  protected fileSize(filePath:any):Promise<number> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "fileSize", filePath);
      this.file.resolveLocalFilesystemUrl(filePath).then((entry:Entry) => {
        this.logger.info(this, "fileSize", filePath, "Entry", entry.fullPath);
        entry.getMetadata((metadata:Metadata) => {
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

  private httpError(error:any):string {
    try {
      if (error == null) {
        this.logger.error(this, "httpError", "Unknown", error);
        return "Unknown error";
      }
      else if (typeof error === 'string') {
        this.logger.error(this, "httpError", "String", error);
        return error['error'] || error;
      }
      else if (typeof error === 'object') {
        this.logger.error(this, "httpError", "Object", error);
        if (error['status'] == 409) {
          return "Conflict";
        }
        else if (error['message']) {
          return error['message'];
        }
        else if (error['error']) {
          if (error['error'].toString().indexOf("The host could not be resolved") != -1) {
            return "The internet connection appears to be offline";
          }
          else if (error['error'].toString().indexOf("The Internet connection appears to be offline") != -1) {
            return "The internet connection appears to be offline";
          }
          else if (error.headers['content-type'] == "application/json") {
            let json = JSON.parse(error['error']);
            if (json['errors']) {
              let errors = json['errors'];
              let messages = [];
              for (let key of Object.keys(errors)) {
                let error = errors[key];
                if (error) {
                  messages.push(error);
                }
              }
              return messages.join(", ");
            }
            else if (json['error']) {
              return json['error'];
            }
            else if (json['message']) {
              return json['message'];
            }
          }
          return JSON.stringify(error['error']);
        }
      }
    }
    catch (err) {
      this.logger.error(this, "httpError", error, "Error", err);
    }
    return JSON.stringify(error);
  }

}
