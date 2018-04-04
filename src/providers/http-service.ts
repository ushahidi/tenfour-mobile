import { Injectable } from '@angular/core';

import { HTTP } from '@ionic-native/http';
import { File, Entry, Metadata } from '@ionic-native/file';
import { FileTransfer, FileTransferObject, FileUploadOptions, FileUploadResult, FileTransferError } from '@ionic-native/file-transfer';

import { LoggerService } from '../providers/logger-service';

@Injectable()
export class HttpService {

  constructor(
    protected http:HTTP,
    protected file:File,
    protected transfer:FileTransfer,
    protected logger:LoggerService) {
  }

  private httpHeaders(accessToken:string=null):{} {
    let headers = {
      Accept: "application/json"
    };
    if (accessToken && accessToken.length > 0) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return headers;
  }

  protected httpGet(url:string, params:any={}, token:string=null) {
    return new Promise((resolve, reject) => {
      let headers = this.httpHeaders(token);
      this.logger.info(this, "GET", url, params, headers);
      this.http.setRequestTimeout(30);
      this.http.setDataSerializer("json");
      this.http.get(url, params, headers).then(
        (response:any) => {
          if (response && response.data) {
            let data = JSON.parse(response.data);
            this.logger.info(this, "GET", url, data);
            resolve(data);
          }
          else {
            this.logger.error(this, "GET", url, "No Response Data");
            reject("No Response Data");
          }
        },
        (error:any) => {
          let data = JSON.parse(error.error);
          this.logger.error(this, "GET", url, data);
          reject(this.httpError(data));
        });
    });
  }

  protected httpPost(url:string, params:any={}, token:string=null) {
    return new Promise((resolve, reject) => {
      let headers = this.httpHeaders(token);
      this.logger.info(this, "POST", url, params, headers);
      this.http.setRequestTimeout(30);
      this.http.setDataSerializer("json");
      this.http.post(url, params, headers).then(
        (response:any) => {
          let data = JSON.parse(response.data);
          this.logger.info(this, "POST", url, data);
          resolve(data);
        },
        (error:any) => {
          let data = JSON.parse(error.error);
          this.logger.error(this, "POST", url, data);
          reject(this.httpError(data));
        }
      );
    });
  }

  protected httpPut(url:string, params:any={}, token:string=null) {
    return new Promise((resolve, reject) => {
      let headers = this.httpHeaders(token);
      this.logger.info(this, "PUT", url, params, headers);
      this.http.setRequestTimeout(30);
      this.http.setDataSerializer("json");
      this.http.put(url, params, headers).then(
        (response:any) => {
          let data = JSON.parse(response.data);
          this.logger.info(this, "PUT", url, data);
          resolve(data);
        },
        (error:any) => {
          let data = JSON.parse(error.error);
          this.logger.error(this, "PUT", url, data);
          reject(this.httpError(data));
        }
      );
    });
  }

  protected httpPatch(url:string, params:any={}, token:string=null) {
    return new Promise((resolve, reject) => {
      let headers = this.httpHeaders(token);
      this.logger.info(this, "PATCH", url, params, headers);
      this.http.setRequestTimeout(30);
      this.http.setDataSerializer("json");
      this.http.patch(url, params, headers).then(
        (response:any) => {
          let data = JSON.parse(response.data);
          this.logger.info(this, "PATCH", url, data);
          resolve(data);
        },
        (error:any) => {
          let data = JSON.parse(error.error);
          this.logger.error(this, "PATCH", url, data);
          reject(this.httpError(data));
        }
      );
    });
  }

  protected httpDelete(url:string, params:any={}, token:string=null) {
    return new Promise((resolve, reject) => {
      let headers = this.httpHeaders(token);
      this.logger.info(this, "DELETE", url, params, headers);
      this.http.setRequestTimeout(30);
      this.http.setDataSerializer("json");
      this.http.delete(url, params, headers).then(
        (response:any) => {
          let data = JSON.parse(response.data);
          this.logger.info(this, "DELETE", url, data);
          resolve(data);
        },
        (error:any) => {
          let data = JSON.parse(error.error);
          this.logger.error(this, "DELETE", url, data);
          reject(this.httpError(data));
        });
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

  private httpError(error:any):string {
    try {
      if (typeof error === 'string') {
        return error;
      }
      else if (error['errors']) {
        let errors = error['errors'];
        let messages = [];
        for (let key of Object.keys(errors)) {
          let error = errors[key];
          if (error) {
            messages.push(error);
          }
        }
        return messages.join(", ");
      }
      else if (error['error']) {
        return error['error'];
      }
      else if (error['message']) {
        return error['message'];
      }
    }
    catch (err) {
      this.logger.error(this, "httpError", "Error", err);
    }
    return JSON.stringify(error);
  }

}
