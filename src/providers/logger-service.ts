import { Injectable } from '@angular/core';

import { Platform } from 'ionic-angular';
import { IsDebug } from '@ionic-native/is-debug';

@Injectable()
export class LoggerService {

  private enabled:boolean = true;

  constructor(
    private isDebug:IsDebug,
    private platform:Platform) {
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

  public log(instance:any, method:string, ...objects:any[]) {
    if (this.enabled) {
      console.log(this.message(instance, method, objects));
    }
  }

  public info(instance:any, method:string, ...objects:any[]) {
    if (this.enabled) {
      console.info(this.message(instance, method, objects));
    }
  }

  public debug(instance:any, method:string, ...objects:any[]) {
    if (this.enabled) {
      console.debug(this.message(instance, method, objects));
    }
  }

  public warn(instance:any, method:string, ...objects:any[]) {
    if (this.enabled) {
      console.warn(this.message(instance, method, objects));
    }
  }

  public error(instance:any, method:string, ...objects:any[]) {
    if (this.enabled) {
      console.error(this.message(instance, method, objects));
    }
  }

  private message(instance:any, method:string, objects:any[]) {
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
