import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Model } from '../../models/model';

@Injectable()
export class WebstoreProvider {

  constructor() {
  }

  public initialize(models:Model[]):Promise<boolean> {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }

  public reset():Promise<boolean> {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }

  public testModel<M extends Model>(type:M):Promise<boolean> {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }

  public getModels<M extends Model>(type:M, where:{}=null, order:{}=null, limit:number=null, offset:number=null):Promise<M[]> {
    return new Promise((resolve, reject) => {
      resolve([]);
    });
  }

  public getModel<M extends Model>(type:M, where:{}=null, order:{}=null):Promise<M> {
    return new Promise((resolve, reject) => {
      resolve(null);
    });
  }

  public saveModel<M extends Model>(model:M, nulls:boolean=true):Promise<boolean> {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }

  public removeModel<M extends Model>(model:M, where:any):Promise<boolean> {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }

  public getMinium<M extends Model>(type:M, column:string):Promise<number> {
    return new Promise((resolve, reject) => {
      resolve(0);
    });
  }

}
