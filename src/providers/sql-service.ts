import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

import { Model, TEXT, INTEGER, DOUBLE, BOOLEAN } from '../models/model';

import { LoggerService } from '../providers/logger-service';

@Injectable()
export class SqlService {

  protected database:SQLiteObject = null;
  protected name:string = 'rollcall.db';
  protected location:string = 'default';

  constructor(
    protected sqlite: SQLite,
    protected platform:Platform,
    protected logger:LoggerService) {
  }

  public testDatabase():boolean {
    return this.platform.platforms().indexOf('cordova') >= 0;
  }

  public openDatabase():Promise<SQLiteObject> {
    return new Promise((resolve, reject) => {
      if (this.database) {
        resolve(this.database);
      }
      else if (this.testDatabase()) {
        let config = {
          name: this.name,
          location: this.location
        };
        this.sqlite.create(config).then((database:SQLiteObject) => {
          this.logger.info(this, "openDatabase", "Opened", database);
          this.database = database;
          resolve(database);
        },
        (error:any) => {
          this.logger.error(this, "openDatabase", "Failed", error);
          reject(JSON.stringify(error));
        });
      }
      else {
        this.logger.error(this, "openDatabase", "Failed", "Cordova Not Available");
        reject(`Error Opening Database`);
      }
    });
  }

  public loadDatabase(models:Model[]):Promise<any> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadDatabase");
      this.createTables(models).then((created:any) => {
        this.logger.info(this, "loadDatabase", "Created", created);
        this.createIndexes(models).then((indexed:any) => {
          this.logger.info(this, "loadDatabase", "Indexed", indexed);
          let tests = [];
          for (let model of models) {
            tests.push(this.testModel(model));
          }
          Promise.all(tests).then((tested:any) => {
            this.logger.info(this, "loadDatabase", "Tested", tested);
            resolve(true);
          },
          (error:any) => {
            this.logger.error(this, "loadDatabase", "Failed", error);
            reject(error);
          });
        },
        (error:any) => {
          this.logger.error(this, "loadDatabase", "Failed", error);
          reject(error);
        });
      },
      (error:any) => {
        this.logger.error(this, "loadDatabase", "Failed", error);
        reject(error);
      });
    });
  }

  public deleteDatabase():Promise<boolean> {
    this.logger.info(this, "deleteDatabase");
    return new Promise((resolve, reject) => {
      let config = {
        name: this.name,
        location: this.location
      };
      this.sqlite.deleteDatabase(config).then((deleted:any) => {
        this.database = null;
        this.logger.info(this, "deleteDatabase", "Deleted");
        resolve(true);
      },
      (error:any) => {
        this.logger.error(this, "deleteDatabase", "Failed", error);
        reject(error);
      });
    });
  }

  private createTables(models:Model[]):Promise<any> {
    let creates = [];
    for (let model of models) {
      creates.push(this.createTable(model));
    }
    return Promise.all(creates);
  }

  private createTable<M extends Model>(model:M):Promise<any> {
    return new Promise((resolve, reject) => {
      this.openDatabase().then((database:SQLiteObject) => {
        let table:string = model.getTable();
        let columns:any[] = model.getColumns();
        this.logger.info(this, "createTable", table, columns);
        let keys:string[] = [];
        let values:string[] = [];
        for (let column of columns) {
          values.push(column.name + ' ' + column.type);
          if (column.key == true) {
            keys.push(column.name);
          }
        }
        let key = "";
        if (keys.length > 0) {
          key = `, PRIMARY KEY (${keys.join(", ")})`;
        }
        let sql = `CREATE TABLE IF NOT EXISTS ${table} (${values.join(", ")}${key})`;
        this.logger.info(this, "createTable", "Creating", sql);
        database.executeSql(sql, []).then((data:any) => {
          this.logger.info(this, "createTable", "Created", sql, data);
          resolve(data);
        },
        (error:any) => {
          this.logger.error(this, "createTable", "Failed", sql, error);
          reject(JSON.stringify(error));
        });
    },
    (error:any) => {
      this.logger.error(this, "createTable", "Failed", error);
      reject(`Error Creating Database Tables`);
    });
    });
  }

  private createIndexes(models:Model[]):Promise<any> {
    let indexes = [];
    for (let model of models) {
      indexes.push(this.createIndex(model));
    }
    return Promise.all(indexes);
  }

  private createIndex<M extends Model>(model:M):Promise<any> {
    return new Promise((resolve, reject) => {
      this.openDatabase().then((database:SQLiteObject) => {
        let table:string = model.getTable();
        let columns:any[] = model.getColumns();
        this.logger.info(this, "createIndex", table, columns);
        let keys:string[] = [];
        for (let column of columns) {
          if (column.key == true) {
            keys.push(column.name);
          }
        }
        let sql = `CREATE UNIQUE INDEX IF NOT EXISTS idx_${table} ON ${table} (${keys.join(", ")});`;
        this.logger.info(this, "createIndex", "Creating", sql);
        database.executeSql(sql, []).then((data:any) => {
          this.logger.info(this, "createIndex", "Created", sql, data);
          resolve(data);
        },
        (error:any) => {
          this.logger.error(this, "createIndex", "Failed", sql, error);
          reject(JSON.stringify(error));
        });
      },
      (error:any) => {
        this.logger.error(this, "createIndex", "Failed", error);
        reject(`Error Creating Database Indexes`);
      });
    });
  }

  private executeFirst(table:string, where:{}=null, order:{}=null):Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.executeSelect(table, where, order, 1, 0).then((rows:any) => {
        let results = <any[]>rows;
        if (results && results.length > 0) {
          resolve(results[0]);
        }
        else {
          reject("No Results");
        }
      });
    });
  }

  private executeTest(table:string, columns:any):Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.openDatabase().then((database:SQLiteObject) => {
        let statement = this.testStatement(table, columns);
        let parameters = [];
        this.logger.info(this, "executeTest", "Testing", statement);
        database.executeSql(statement, parameters).then((data:any) => {
          this.logger.info(this, "executeTest", "Tested", statement);
          resolve(true);
        },
        (error:any) => {
          this.logger.error(this, "executeTest", "Failed", statement, error);
          reject(JSON.stringify(error));
        });
      },
      (error:any) => {
        this.logger.error(this, "executeSelect", "Failed", error);
        reject(error);
      });
    });
  }

  private executeSelect(table:string, where:{}=null, order:{}=null, limit:number=null, offset:number=null):Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.openDatabase().then((database:SQLiteObject) => {
        let statement = this.selectStatement(table, where, order, limit, offset);
        let parameters = this.selectParameters(table, where, order);
        this.logger.info(this, "executeSelect", "Selecting", statement, parameters);
        database.executeSql(statement, parameters).then((data:any) => {
          let results = [];
          if (data.rows && data.rows.length > 0) {
            for (let i = 0; i < data.rows.length; i++) {
              let row = data.rows.item(i);
              this.logger.info(this, "executeSelect", table, row);
              results.push(row);
            }
          }
          this.logger.info(this, "executeSelect", "Selected", statement, results);
          resolve(results);
        },
        (error:any) => {
          this.logger.error(this, "executeSelect", "Failed", statement, error);
          reject(JSON.stringify(error));
        });
      },
      (error:any) => {
        this.logger.error(this, "executeSelect", "Failed", error);
        reject(error);
      });
    });
  }

  private executeInsert(table:string, columns:any, values:{}):Promise<number> {
    return new Promise((resolve, reject) => {
      this.openDatabase().then((database:SQLiteObject) => {
        let statement = this.insertStatement(table, columns, values);
        let parameters = this.insertParameters(table, columns, values);
        this.logger.info(this, "executeInsert", "Inserting", statement, parameters);
        database.executeSql(statement, parameters).then((results:any) => {
          this.logger.info(this, "executeInsert", "Inserted", statement, parameters, results);
          resolve(results['insertId']);
        },
        (error:any) => {
          this.logger.error(this, "executeInsert", "Failed", statement, parameters, error);
          reject(JSON.stringify(error));
        });
      },
      (error:any) => {
        this.logger.error(this, "executeInsert", "Failed", error);
        reject(JSON.stringify(error));
      });
    });
  }

  private executeUpdate(table:string, columns:any[], values:{}, nulls:boolean=true):Promise<number> {
    return new Promise((resolve, reject) => {
      this.openDatabase().then((database:SQLiteObject) => {
        let statement = this.updateStatement(table, columns, values, nulls);
        let parameters = this.updateParameters(table, columns, values, nulls);
        this.logger.info(this, "executeUpdate", "Updating", statement, parameters);
        database.executeSql(statement, parameters).then((results:any) => {
          this.logger.info(this, "executeUpdate", "Updated", statement, parameters, results);
          resolve(results['rowsAffected']);
        },
        (error:any) => {
          this.logger.error(this, "executeUpdate", "Failed", statement, parameters, error);
          reject(JSON.stringify(error));
        });
      },
      (error:any) => {
        this.logger.error(this, "executeUpdate", "Failed", error);
        reject(JSON.stringify(error));
      });
    });
  }

  private executeDelete(table:string, where:{}):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.openDatabase().then((database:SQLiteObject) => {
        let statement = this.deleteStatement(table, where);
        this.logger.info(this, "executeDelete", "Deleting", statement);
        database.executeSql(statement, []).then((results:any) => {
          this.logger.info(this, "executeDelete", "Deleted", statement, results);
          resolve(results['rowsAffected'] > 0);
        },
        (error:any) => {
          this.logger.error(this, "executeDelete", "Failed", statement, error);
          reject(JSON.stringify(error));
        });
      },
      (error:any) => {
        this.logger.error(this, "executeDelete", "Failed", error);
        reject(JSON.stringify(error));
      });
    });
  }

  private testStatement(table:string, columns:any[]):string {
    let query = [`SELECT`];
    let names = [];
    for (let column of columns) {
      names.push(column.name);
    }
    query.push(names.join(", "));
    query.push(`FROM ${table}`);
    query.push(`LIMIT 0`);
    return query.join(" ");
  }

  private selectStatement(table:string, where:{}=null, order:{}=null, limit:number=null, offset:number=null) {
    let query = [`SELECT * FROM ${table}`];
    if (where != null && Object.keys(where).length > 0) {
      let clause = [];
      for (let column in where) {
        let parameter = where[column];
        if (Array.isArray(parameter)) {
          let inClause = [];
          for (let i = 0; i < parameter.length; i++) {
            inClause.push("?");
          }
          clause.push(`${column} IN (${inClause.join(', ')})`);
        }
        else if (parameter && parameter.toString().indexOf("%") != -1){
          clause.push(`${column} LIKE ?`);
        }
        else {
          clause.push(`${column} = ?`);
        }
      }
      query.push(`WHERE ${clause.join(' AND ')}`);
    }
    if (order != null && Object.keys(order).length > 0) {
      let sort = [];
      for (let column in order) {
        sort.push(`${column} ${order[column]}`);
      }
      query.push(`ORDER BY ${sort.join(', ')}`);
    }
    if (limit != null) {
      query.push(`LIMIT ${limit}`);
    }
    if (offset != null) {
      query.push(`OFFSET ${offset}`);
    }
    return query.join(" ");
  }

  private selectParameters(table:string, where:{}=null, order:{}=null): any[] {
    let parameters = [];
    if (where != null && Object.keys(where).length > 0) {
      for (let column in where) {
        let parameter = where[column];
        if (Array.isArray(parameter)) {
          for (let param of parameter) {
            parameters.push(param);
          }
        }
        else {
          parameters.push(parameter);
        }
      }
    }
    return parameters;
  }

  private insertStatement(table:string, columns:any[], values:{}):string {
    let names = [];
    let params = [];
    for (let column of columns) {
      let value = values[column.name];
      if (value != null) {
        names.push(column.name);
        params.push("?");
      }
    }
    return `INSERT INTO ${table} (${names.join(", ")}) VALUES (${params.join(", ")})`;
  }

  private insertParameters(table:string, columns:any[], values:{}):any {
    let params:any[] = [];
    for (let column of columns) {
      let value = values[column.name];
      if (value != null) {
        params.push(value);
      }
    }
    return params;
  }

  private updateStatement(table:string, columns:any[], values:{}, nulls:boolean=true):string {
    let params:any[] = [];
    let clause = [];
    for (let column of columns) {
      if (column.key == true) {
        clause.push(`${column.name} = ?`);
      }
      else if (column.property in values) {
        let value = values[column.name];
        if (nulls) {
          params.push(`${column.name} = ?`);
        }
        else if (value != null) {
          params.push(`${column.name} = ?`);
        }
      }
    }
    return `UPDATE ${table} SET ${params.join(", ")} WHERE ${clause.join(" AND ")}`;
  }

  private updateParameters(table:string, columns:any[], values:{}, nulls:boolean=true):any {
    let params:any[] = [];
    let clause = [];
    for (let column of columns) {
      let value = values[column.property];
      if (column.key == true) {
        clause.push(value);
      }
      else if (column.property in values) {
        if (nulls) {
          params.push(value);
        }
        else if (value != null) {
          params.push(value);
        }
      }
    }
    return params.concat(clause);
  }

  private deleteStatement(table:string, where:{}):string {
    let clause = [];
    if (where && Object.keys(where).length > 0) {
      for (let column in where) {
        clause.push(`${column} = '${where[column]}'`);
      }
    }
    else {
      clause.push("id IS NOT NULL");
    }
    return `DELETE FROM ${table} WHERE ${clause.join(' AND ')}`;
  }

  protected testModel<M extends Model>(type:M):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.executeTest(type.getTable(), type.getColumns()).then((rows:any) => {
        resolve(true);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  protected getModels<M extends Model>(type:M, where:{}=null, order:{}=null, limit:number=null, offset:number=null):Promise<M[]> {
    return new Promise((resolve, reject) => {
      this.executeSelect(type.getTable(), where, order, limit, offset).then((rows:any) => {
        let models = [];
        let columns = type.getColumns();
        for (let i = 0; i < rows.length; i++) {
          let row = rows[i];
          let values = {};
          for (let column of columns) {
            if (column.type == INTEGER) {
              values[column.property] = row[column.name];
            }
            else if (column.type == DOUBLE) {
              values[column.property] = row[column.name];
            }
            else if (column.type == BOOLEAN) {
              if (row[column.name] == 'true') {
                values[column.property] = true;
              }
              else if (row[column.name] == "1") {
                values[column.property] = true;
              }
              else if (row[column.name] == 1) {
                values[column.property] = true;
              }
              else {
                values[column.property] = false;
              }
            }
            else if (column.type == TEXT) {
              values[column.property] = row[column.name];
            }
            else {
              values[column.property] = row[column.name];
            }
          }
          let model = type.newInstance<M>(values);
          models.push(model);
        }
        resolve(models);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  protected getModel<M extends Model>(type:M, where:{}=null, order:{}=null):Promise<M> {
    return new Promise((resolve, reject) => {
      this.executeFirst(type.getTable(), where, order).then((row:any) => {
        let columns = type.getColumns();
        let values = {};
        for (let column of columns) {
          if (column.type == INTEGER) {
            values[column.property] = row[column.name];
          }
          else if (column.type == DOUBLE) {
            values[column.property] = row[column.name];
          }
          else if (column.type == BOOLEAN) {
            if (row[column.name] == 'true') {
              values[column.property] = true;
            }
            else if (row[column.name] == "1") {
              values[column.property] = true;
            }
            else if (row[column.name] == 1) {
              values[column.property] = true;
            }
            else {
              values[column.property] = false;
            }
          }
          else if (column.type == TEXT) {
            values[column.property] = row[column.name];
          }
          else {
            values[column.property] = row[column.name];
          }
        }
        let model = type.newInstance<M>(values);
        resolve(model);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  protected saveModel<M extends Model>(model:M, nulls:boolean=true):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let table:string = model.getTable();
      let columns:any[] = model.getColumns();
      let values:any[] = model.getValues();
      if (model.hasKeys()) {
        this.executeUpdate(table, columns, values, nulls).then((updated:number) => {
          if (updated > 0) {
            this.logger.info(this, "saveModel", table, "Updated", updated);
            resolve(updated > 0);
          }
          else {
            this.executeInsert(table, columns, values).then((inserted:number) => {
              this.logger.info(this, "saveModel", table, "Inserted", inserted);
              if (model.id == null) {
                model.id = inserted;
              }
              resolve(inserted != null);
            },
            (_error:any) => {
              this.logger.error(this, "saveModel", table, "Inserted", _error);
              reject(_error);
            });
          }
        },
        (error:any) => {
          this.logger.error(this, "saveModel", table, "Updated", error);
          this.executeInsert(table, columns, values).then((inserted:number) => {
            this.logger.info(this, "saveModel", table, "Inserted", inserted);
            if (model.id == null) {
              model.id = inserted;
            }
            resolve(inserted != null);
          },
          (_error:any) => {
            this.logger.error(this, "saveModel", table, "Inserted", _error);
            reject(_error);
          });
        });
      }
      else {
        this.executeInsert(table, columns, values).then((inserted:number) => {
          this.logger.info(this, "saveModel", table, "Inserted", inserted);
          if (model.id == null) {
            model.id = inserted;
          }
          resolve(inserted != null);
        },
        (error:any) => {
          this.logger.error(this, "saveModel", table, "Inserted", error);
          reject(error);
        });
      }
    });
  }

  protected removeModel<M extends Model>(model:M, where:any):Promise<boolean> {
    return this.executeDelete(model.getTable(), where);
  }

  protected getMinium<M extends Model>(type:M, column:string):Promise<number> {
    return new Promise((resolve, reject) => {
      this.openDatabase().then((database:SQLiteObject) => {
        let statement = `SELECT MIN(${column}) as value FROM ${type.getTable()}`;
        database.executeSql(statement, []).then((data:any) => {
          this.logger.info(this, "getMinium", type.getTable(), column, data);
          if (data.rows && data.rows.length > 0) {
            let row = data.rows.item(0);
            resolve(row.value);
          }
          else {
            resolve(0);
          }
        },
        (error:any) => {
          this.logger.error(this, "executeSelect", "Failed", statement, error);
          reject(JSON.stringify(error));
        });
      });
    });
  }

}
