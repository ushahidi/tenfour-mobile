import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

import { Model, TEXT, INTEGER, DOUBLE, BOOLEAN } from '../models/model';

import { LoggerService } from '../providers/logger-service';
import { SqlService } from '../providers/sql-service';

import { Token } from '../models/token';
import { Email } from '../models/email';
import { Person } from '../models/person';
import { Organization } from '../models/organization';

@Injectable()
export class DatabaseService extends SqlService {

  constructor(
    protected sqlite: SQLite,
    protected platform:Platform,
    protected logger:LoggerService) {
    super(sqlite, platform, logger);
  }

  // ########## ORGANIZATION ##########

  saveOrganization(organization:Organization) {
    return this.saveModel(organization);
  }

  getOrganizations(where:{}=null, order:{}=null):Promise<Organization[]> {
    return this.getModels<Organization>(new Organization(), where, order);
  }

  getOrganization(id:number):Promise<Organization> {
    let where = { id: id };
    return this.getModel<Organization>(new Organization(), where);
  }

  removeOrganization(organization:Organization) {
    let where = { id: organization.id };
    return this.removeModel<Organization>(new Organization(), where);
  }

  removeOrganizations() {
    let where = { };
    return this.removeModel<Organization>(new Organization(), where);
  }

  // ########## EMAIL ##########

  saveEmail(email:Email) {
    return this.saveModel(email);
  }

  getEmails(where:{}=null, order:{}=null):Promise<Email[]> {
    return this.getModels<Email>(new Email(), where, order);
  }

  getEmail(id:number):Promise<Email> {
    let where = { id: id };
    return this.getModel<Email>(new Email(), where);
  }

  removeEmail(email:Email) {
    let where = { id: email.id };
    return this.removeModel<Email>(new Email(), where);
  }

  removeEmails() {
    let where = { };
    return this.removeModel<Email>(new Email(), where);
  }

  // ########## PERSON ##########

  savePerson(person:Person) {
    return this.saveModel(person);
  }

  getPersons(where:{}=null, order:{}=null):Promise<Person[]> {
    return this.getModels<Person>(new Person(), where, order);
  }

  getPerson(id:number):Promise<Person> {
    let where = { id: id };
    return this.getModel<Person>(new Person(), where);
  }

  removePerson(person:Person) {
    let where = { id: person.id };
    return this.removeModel<Person>(new Person(), where);
  }

  removePeople() {
    let where = { };
    return this.removeModel<Person>(new Person(), where);
  }

  // ########## TOKEN ##########

  saveToken(token:Token) {
    return this.saveModel(token);
  }

  getTokens(where:{}=null, order:{}=null):Promise<Token[]> {
    return this.getModels<Token>(new Token(), where, order);
  }

  getToken(id:number):Promise<Token> {
    let where = { id: id };
    return this.getModel<Token>(new Token(), where);
  }

  removeToken(token:Token) {
    let where = { id: token.id };
    return this.removeModel<Token>(new Token(), where);
  }

  removeTokens() {
    let where = { };
    return this.removeModel<Token>(new Token(), where);
  }

}
