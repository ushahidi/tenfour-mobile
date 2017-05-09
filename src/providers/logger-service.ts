import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { IsDebug } from '@ionic-native/is-debug';

@Injectable()
export class LoggerService {

  private enabled:boolean = true;

  constructor(
    private isDebug:IsDebug,
    protected platform: Platform) {
    this.platform.ready().then(() => {
      this.isDebug.getIsDebug().then(
        (isDebug:boolean) => {
          this.enabled = isDebug;
        },
        (error:any) => {
          this.enabled = false;
        });
    });
  }

  log(instance:any, method:string, ...objects:any[]) {
    if (this.enabled) {
      console.log(this.message(instance, method, objects));
    }
  }

  info(instance:any, method:string, ...objects:any[]) {
    if (this.enabled) {
      console.info(this.message(instance, method, objects));
    }
  }

  debug(instance:any, method:string, ...objects:any[]) {
    if (this.enabled) {
      console.debug(this.message(instance, method, objects));
    }
  }

  warn(instance:any, method:string, ...objects:any[]) {
    if (this.enabled) {
      console.warn(this.message(instance, method, objects));
    }
  }

  error(instance:any, method:string, ...objects:any[]) {
    if (this.enabled) {
      console.error(this.message(instance, method, objects));
    }
  }

  message(instance:any, method:string, objects:any[]) {
    let messages = [];
    if (instance != null) {
      messages.push(instance.constructor.name);
    }
    if (method != null) {
      messages.push(method);
    }
    if (objects && objects.length > 0) {
      for (let index in objects) {
        let object = objects[index];
        try {
          if (typeof object === 'string' || object instanceof String) {
            messages.push(object);
          }
          else {
            messages.push(JSON.stringify(object));
          }
        }
        catch(error) {
          messages.push(object);
        }
      }
    }
    return messages.join(" ");
  }

}
