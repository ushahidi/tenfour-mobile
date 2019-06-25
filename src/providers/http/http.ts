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

  readonly TIMEOUT:number = 1 * 60 * 1000;
  readonly TIMEOUT_UPLOAD:number = 5 * 60 * 1000;

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

  private httpParameters(params:any=null):any {
    let parameters = {};
    if (params) {
      for (let key of Object.keys(params)) {
        let value = params[key];
        if (typeof value == 'number') {
          parameters[key] = "" + value;
        }
        else {
          parameters[key] = value;
        }
      }
    }
    return parameters;
  }

  protected httpGet(url:string, params:any={}, token:string=null):Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        let headers = this.httpHeaders(token);
        let parameters = this.httpParameters(params);
        this.logger.info(this, "GET", url, parameters, headers);
        this.httpNative.setRequestTimeout(30);
        this.httpNative.setDataSerializer("json");
        this.httpNative.get(url, parameters, headers).then((response:any) => {
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
          search: search
        });
        this.logger.info(this, "GET", url, params);
        this.http.get(url, options)
          .timeout(this.TIMEOUT)
          .map((res:any) => this.httpResponse(res))
          .catch((error:any) => {
            return Observable.throw(error || 'Request Error');
          })
          .subscribe((items) => {
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
        let parameters = this.httpParameters(params);
        this.logger.info(this, "POST", url, params, headers);
        this.httpNative.setRequestTimeout(30);
        this.httpNative.setDataSerializer("json");
        this.httpNative.post(url, parameters, headers).then((response:any) => {
          if (response.data) {
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
          .timeout(this.TIMEOUT)
          .map((res:any) => this.httpResponse(res))
          .catch((error:any) => {
            return Observable.throw(error || 'Request Error');
          })
          .subscribe((json) => {
            this.logger.info(this, "POST", url, json);
            resolve(json);
          },
          (error) => {
            this.logger.error(this, "POST", url, error);
            reject(this.httpError(error));
          });
      }
    });
  }

  protected httpPut(url:string, params:any={}, token:string=null):Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        let headers = this.httpHeaders(token, "application/json");
        let parameters = this.httpParameters(params);
        this.logger.info(this, "PUT", url, parameters, headers);
        this.httpNative.setRequestTimeout(30);
        this.httpNative.setDataSerializer("json");
        this.httpNative.put(url, parameters, headers).then((response:any) => {
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
          .timeout(this.TIMEOUT)
          .map((res:any) => this.httpResponse(res))
          .catch((error:any) => {
            return Observable.throw(error || 'Request Error');
          })
          .subscribe((json) => {
            this.logger.info(this, "PUT", url, json);
            resolve(json);
          },
          (error) => {
            this.logger.error(this, "PUT", url, error);
            reject(this.httpError(error));
          });
      }
    });
  }

  protected httpPatch(url:string, params:any={}, token:string=null):Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        let headers = this.httpHeaders(token, "application/json");
        let parameters = this.httpParameters(params);
        this.logger.info(this, "PATCH", url, parameters, headers);
        this.httpNative.setRequestTimeout(30);
        this.httpNative.setDataSerializer("json");
        this.httpNative.patch(url, parameters, headers).then((response:any) => {
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
          .timeout(this.TIMEOUT)
          .map((res:any) => this.httpResponse(res))
          .catch((error:any) => {
            return Observable.throw(error || 'Request Error');
          })
          .subscribe((json) => {
            this.logger.info(this, "PATCH", url, json);
            resolve(json);
          },
          (error) => {
            this.logger.error(this, "PATCH", url, error);
            reject(this.httpError(error));
          });
      }
    });
  }

  protected httpDelete(url:string, params:any={}, token:string=null):Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        let headers = this.httpHeaders(token);
        let parameters = this.httpParameters(params);
        this.logger.info(this, "DELETE", url, parameters, headers);
        this.httpNative.setRequestTimeout(30);
        this.httpNative.setDataSerializer("json");
        this.httpNative.delete(url, parameters, headers).then((response:any) => {
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
          .timeout(this.TIMEOUT)
          .map((res:any) => this.httpResponse(res))
          .catch((error:any) => {
            return Observable.throw(error || 'Request Error');
          })
          .subscribe((items) => {
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

  protected fileUpload(url:string, token:string, file:any, httpMethod:string="POST", mimeType:string='application/binary', acceptType:string="application/json", contentType:string=null, contentLength:number=null):Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
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
        let params = {};
        let options:FileUploadOptions = {
          httpMethod: httpMethod,
          mimeType: mimeType,
          fileName: file.name,
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
      }
      else {
        this.logger.info(this, "POST", url);
        let params:FormData = new FormData();
        params.append('file', file, file.name);
        let headers = new Headers(this.httpHeaders(token));
        let options = new RequestOptions({
          headers: headers
        });
        this.logger.info(this, "POST", url, params);
        this.http.post(url, params, options)
          .timeout(this.TIMEOUT_UPLOAD)
          .map((res:any) => this.httpResponse(res))
          .catch((error:any) => {
            return Observable.throw(error || 'Request Error');
          })
          .subscribe((json) => {
            this.logger.info(this, "POST", url, json);
            resolve(json);
          },
          (error) => {
            this.logger.error(this, "POST", url, error);
            reject(this.httpError(error));
          });
      }
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

  private httpResponse(res:any):any {
    if (res.status == 204) {
      return {}
    }
    try {
      return res.json();
    }
    catch (err) {
      return {};
    }
  }

  private httpError(error:any):string {
    if (error == null) {
      return "An unknown error has occurred";
    }
    if (typeof error === 'string') {
      return error['error'] || error;
    }
    if (typeof error === 'object') {
      if (error['_body'] || error['message'] || error['error']) {
        let message = error['_body'] || error['message'] || error['error']
        if (message.toString().indexOf("The host could not be resolved") != -1) {
          return "The internet connection appears to be offline";
        }
        else if (message.toString().indexOf("The Internet connection appears to be offline") != -1) {
          return "The internet connection appears to be offline";
        }
        else if (message.toString().indexOf("Timeout") != -1) {
          return "The request has timed out";
        }
        else if (message.toString().substring(0,1) !== "[" && message.toString().substring(0,1) !== "{") {
          return message.toString();
        }
        else {
          let json;

          try {
            json = JSON.parse(message);
          } catch (err) {
            return "An unknown error has occurred";
          }

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
      }
    }
    if (error['status'] == 401) {
      return "You are not authorized to access";
    }
    else if (error['status'] == 402) {
      return "You do not have enough credits";
    }
    else if (error['status'] == 403) {
      return "You are forbidden to access";
    }
    else if (error['status'] == 404) {
      return "The resource was not found";
    }
    else if (error['status'] == 405) {
      return "The method is not allowed";
    }
    else if (error['status'] == 406) {
      return "Information not acceptable";
    }
    else if (error['status'] == 408) {
      return "The request has timed out";
    }
    else if (error['status'] == 409) {
      return "Unable to process due to conflict";
    }
    else if (error['status'] == 500) {
      return "Internal server error has occurred";
    }
    else if (error['status'] == 501) {
      return "The method is not implemented";
    }
    else if (error['status'] == 502) {
      return "There was a bad gateway";
    }
    else if (error['status'] == 503) {
      return "The service is unavailable";
    }
    return "An unknown error has occurred";
  }

}
