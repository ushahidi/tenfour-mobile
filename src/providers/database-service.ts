import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SQLite } from '@ionic-native/sqlite';

import { SqlService } from '../providers/sql-service';
import { LoggerService } from '../providers/logger-service';

import { Email } from '../models/email';
import { Person } from '../models/person';
import { Contact } from '../models/contact';
import { Rollcall } from '../models/rollcall';
import { Organization } from '../models/organization';
import { Answer } from '../models/answer';
import { Reply } from '../models/reply';

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

  saveRollcall(organization:Organization, rollcall:Rollcall):Promise<any> {
    rollcall.organization_id = organization.id;
    return this.saveModel(rollcall);
  }

  getRollcalls(organization:Organization):Promise<Rollcall[]> {
    let where = { organization_id: organization.id };
    let order = { };
    return this.getModels<Rollcall>(new Rollcall(), where, order);
  }

  getRollcall(id:number):Promise<Rollcall> {
    return new Promise((resolve, reject) => {
      let where = { id: id };
      this.getModel<Rollcall>(new Rollcall(), where).then((rollcall:Rollcall) => {
        Promise.all([
          this.getAnswers(rollcall),
          this.getReplies(rollcall)]).then((results:any[]) => {
            rollcall.answers = <Answer[]>results[0];
            rollcall.replies = <Reply[]>results[1];
            resolve(rollcall);
        });
      });
    });
  }

  removeRollcall(rollcall:Rollcall):Promise<any> {
    let where = { id: rollcall.id };
    return this.removeModel<Rollcall>(new Rollcall(), where);
  }

  removeRollcalls(organization:Organization=null) {
    let where = { };
    if (organization) {
      where['organization_id'] = organization.id;
    }
    return this.removeModel<Rollcall>(new Rollcall(), where);
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

  // ########## ANSWER ##########

  saveAnswer(rollcall:Rollcall, answer:Answer):Promise<any> {
    answer.organization_id = rollcall.organization_id;
    answer.rollcall_id = rollcall.id;
    return this.saveModel(answer);
  }

  getAnswers(rollcall:Rollcall):Promise<Answer[]> {
    let where = { rollcall_id: rollcall.id };
    let order = { };
    return this.getModels<Answer>(new Answer(), where, order);
  }

  getAnswer(id:number):Promise<Answer> {
    let where = { id: id };
    return this.getModel<Answer>(new Answer(), where);
  }

  removeAnswer(answer:Answer):Promise<any> {
    let where = { id: answer.id };
    return this.removeModel<Answer>(new Answer(), where);
  }

  removeAnswers(rollcall:Rollcall=null) {
    let where = { };
    if (rollcall) {
      where['rollcall_id'] = rollcall.id;
    }
    return this.removeModel<Answer>(new Answer(), where);
  }

  // ########## REPLY ##########

  saveReply(rollcall:Rollcall, reply:Reply):Promise<any> {
    reply.organization_id = rollcall.organization_id;
    reply.rollcall_id = rollcall.id;
    return this.saveModel(reply);
  }

  getReplies(rollcall:Rollcall):Promise<Reply[]> {
    let where = { rollcall_id: rollcall.id };
    let order = { };
    return this.getModels<Reply>(new Reply(), where, order);
  }

  getReply(id:number):Promise<Reply> {
    let where = { id: id };
    return this.getModel<Reply>(new Reply(), where);
  }

  removeReply(reply:Reply):Promise<any> {
    let where = { id: reply.id };
    return this.removeModel<Reply>(new Reply(), where);
  }

  removeReplies(rollcall:Rollcall=null) {
    let where = { };
    if (rollcall) {
      where['rollcall_id'] = rollcall.id;
    }
    return this.removeModel<Reply>(new Reply(), where);
  }

}
