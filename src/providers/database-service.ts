import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SQLite } from '@ionic-native/sqlite';

import { SqlService } from '../providers/sql-service';
import { LoggerService } from '../providers/logger-service';

import { Email } from '../models/email';
import { Person } from '../models/person';
import { Contact } from '../models/contact';
import { RollCall } from '../models/rollcall';
import { Organization } from '../models/organization';

@Injectable()
export class DatabaseService extends SqlService {

  constructor(
    protected sqlite:SQLite,
    protected platform:Platform,
    protected logger:LoggerService) {
    super(sqlite, platform, logger);
  }

  // ########## ORGANIZATION ##########

  saveOrganization(organization:Organization):Promise<any> {
    return this.saveModel(organization);
  }

  getOrganizations(where:{}=null, order:{}=null):Promise<Organization[]> {
    return this.getModels<Organization>(new Organization(), where, order);
  }

  getOrganization(id:number):Promise<Organization> {
    let where = { id: id };
    return this.getModel<Organization>(new Organization(), where);
  }

  removeOrganization(organization:Organization):Promise<any> {
    let where = { id: organization.id };
    return this.removeModel<Organization>(new Organization(), where);
  }

  removeOrganizations():Promise<any> {
    let where = { };
    return this.removeModel<Organization>(new Organization(), where);
  }

  // ########## PERSON ##########

  savePerson(organization:Organization, person:Person):Promise<any> {
    person.organization_id = organization.id;
    return this.saveModel(person);
  }

  getPeople(organization:Organization):Promise<Person[]> {
    let where = { organization_id: organization.id };
    let order = { };
    return this.getModels<Person>(new Person(), where, order);
  }

  getPerson(id:number):Promise<Person> {
    let where = { };
    if (id) {
      where["id"] = id;
    }
    return this.getModel<Person>(new Person(), where);
  }

  removePerson(person:Person):Promise<any> {
    let where = { id: person.id };
    return this.removeModel<Person>(new Person(), where);
  }

  removePeople(organization:Organization=null) {
    let where = { };
    if (organization) {
      where['organization_id'] = organization.id;
    }
    return this.removeModel<Person>(new Person(), where);
  }

  // ########## ROLLCALL ##########

  saveRollCall(organization:Organization, rollcall:RollCall):Promise<any> {
    rollcall.organization_id = organization.id;
    return this.saveModel(rollcall);
  }

  getRollCalls(organization:Organization):Promise<RollCall[]> {
    let where = { organization_id: organization.id };
    let order = { };
    return this.getModels<RollCall>(new RollCall(), where, order);
  }

  getRollCall(id:number):Promise<RollCall> {
    let where = { id: id };
    return this.getModel<RollCall>(new RollCall(), where);
  }

  removeRollCall(rollcall:RollCall):Promise<any> {
    let where = { id: rollcall.id };
    return this.removeModel<RollCall>(new RollCall(), where);
  }

  removeRollCalls(organization:Organization=null) {
    let where = { };
    if (organization) {
      where['organization_id'] = organization.id;
    }
    return this.removeModel<RollCall>(new RollCall(), where);
  }

  // ########## EMAIL ##########

  saveEmail(organization:Organization, email:Email):Promise<any> {
    email.organization_id = organization.id;
    return this.saveModel(email);
  }

  getEmails(organization:Organization):Promise<Email[]> {
    let where = { organization_id: organization.id };
    let order = { };
    return this.getModels<Email>(new Email(), where, order);
  }

  getEmail(id:number):Promise<Email> {
    let where = { id: id };
    return this.getModel<Email>(new Email(), where);
  }

  removeEmail(email:Email):Promise<any> {
    let where = { id: email.id };
    return this.removeModel<Email>(new Email(), where);
  }

  removeEmails(organization:Organization=null) {
    let where = { };
    if (organization) {
      where['organization_id'] = organization.id;
    }
    return this.removeModel<Email>(new Email(), where);
  }

  // ########## CONTACT ##########

  saveContact(person:Person, contact:Contact):Promise<any> {
    contact.organization_id = person.organization_id;
    contact.person_id = person.id;
    return this.saveModel(contact);
  }

  getContacts(person:Person):Promise<Contact[]> {
    let where = { person_id: person.id };
    let order = { };
    return this.getModels<Contact>(new Contact(), where, order);
  }

  getContact(id:number):Promise<Contact> {
    let where = { id: id };
    return this.getModel<Contact>(new Contact(), where);
  }

  removeContact(contact:Contact):Promise<any> {
    let where = { id: contact.id };
    return this.removeModel<Contact>(new Contact(), where);
  }

  removeContacts(person:Person=null) {
    let where = { };
    if (person) {
      where['person_id'] = person.id;
    }
    return this.removeModel<Contact>(new Contact(), where);
  }

}
