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
import { Recipient } from '../models/recipient';
import { Group } from '../models/group';
import { Settings } from '../models/settings';
import { Subscription } from '../models/subscription';
import { Notification } from '../models/notification';

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

  getPeople(organization:Organization, ids:number[]=null):Promise<Person[]> {
    return new Promise((resolve, reject) => {
      let where = { };
      if (organization) {
        where["organization_id"] = organization.id;
      }
      if (ids) {
        where["id"] = ids;
      }
      let order = { name: "ASC" };
      this.getModels<Person>(new Person(), where, order).then((people:Person[]) => {
        let people_ids = people.map((people:Person) => people.id);
        this.getContacts(null, people_ids).then((contacts:Contact[]) => {
          for (let person of people) {
            person.contacts = contacts.filter(contact => contact.person_id == person.id);
          }
          resolve(people);
        },
        (error:any) => {
          reject(error);
        });
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  getPerson(id:number, me:boolean=false):Promise<Person> {
    return new Promise((resolve, reject) => {
      let where = { };
      if (id) {
        where["id"] = id;
      }
      if (me) {
        where["me"] = true;
      }
      this.getModel<Person>(new Person(), where).then((person:Person) => {
        this.getContacts(person).then((contacts:Contact[]) => {
          person.contacts = contacts;
          resolve(person);
        },
        (error:any) => {
          reject(error);
        });
      },
      (error:any) => {
        reject(error);
      });
    });
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

  // ########## CONTACT ##########

  saveContact(person:Person, contact:Contact):Promise<any> {
    contact.organization_id = person.organization_id;
    contact.person_id = person.id;
    return this.saveModel(contact);
  }

  getContacts(person:Person, people_ids:number[]=null):Promise<Contact[]> {
    let where = { };
    if (person) {
      where['id'] = person.id;
    }
    if (people_ids) {
      where['person_id'] = people_ids;
    }
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

  // ########## ROLLCALL ##########

  saveRollcall(organization:Organization, rollcall:Rollcall):Promise<any> {
    rollcall.organization_id = organization.id;
    return this.saveModel(rollcall);
  }

  getRollcalls(organization:Organization):Promise<Rollcall[]> {
    return new Promise((resolve, reject) => {
      let where = { organization_id: organization.id };
      let order = { created_at: "DESC" };
      this.getModels<Rollcall>(new Rollcall(), where, order).then((rollcalls:Rollcall[]) => {
        let rollcall_ids = rollcalls.map((rollcall:Rollcall) => rollcall.id);
        this.logger.info(this, "getRollcalls", rollcall_ids);
        Promise.all([
          this.getAnswers(null, rollcall_ids),
          this.getReplies(null, rollcall_ids),
          this.getRecipients(null, rollcall_ids)]).then((results:any[]) => {
            let answers = <Answer[]>results[0];
            let replies = <Reply[]>results[1];
            let recipients = <Recipient[]>results[2];
            for (let rollcall of rollcalls) {
              rollcall.answers = answers.filter(answer => answer.rollcall_id == rollcall.id);
              rollcall.replies = replies.filter(reply => reply.rollcall_id == rollcall.id);
              rollcall.recipients = recipients.filter(recipient => recipient.rollcall_id == rollcall.id);
            }
            resolve(rollcalls);
        });
        resolve(rollcalls);
      });
    });
  }

  getRollcall(id:number):Promise<Rollcall> {
    return new Promise((resolve, reject) => {
      let where = { id: id };
      this.getModel<Rollcall>(new Rollcall(), where).then((rollcall:Rollcall) => {
        Promise.all([
          this.getAnswers(rollcall),
          this.getReplies(rollcall),
          this.getRecipients(rollcall)]).then((results:any[]) => {
            rollcall.answers = <Answer[]>results[0];
            rollcall.replies = <Reply[]>results[1];
            rollcall.recipients = <Recipient[]>results[2];
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

  // ########## ANSWER ##########

  saveAnswer(rollcall:Rollcall, answer:Answer):Promise<any> {
    answer.organization_id = rollcall.organization_id;
    answer.rollcall_id = rollcall.id;
    return this.saveModel(answer);
  }

  getAnswers(rollcall:Rollcall, rollcall_ids:number[]=null):Promise<Answer[]> {
    let where = { };
    if (rollcall) {
      where['rollcall_id'] = rollcall.id;
    }
    if (rollcall_ids) {
      where['rollcall_id'] = rollcall_ids;
    }
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

  getReplies(rollcall:Rollcall, rollcall_ids:number[]=null):Promise<Reply[]> {
    return new Promise((resolve, reject) => {
      let where = { };
      if (rollcall) {
        where['rollcall_id'] = rollcall.id;
      }
      if (rollcall_ids) {
        where['rollcall_id'] = rollcall_ids;
      }
      let order = {  created_at: "DESC" };
      this.getModels<Reply>(new Reply(), where, order).then((replies:Reply[]) => {
        resolve(replies);
        // let user_ids = replies.map((reply) => reply.user_id);
        // this.getPeople(null, user_ids).then((users:User[]) => {
        //   for (let reply of replies) {
        //     let user = users.find(user => user.id == reply.user_id);
        //     reply.user_id = user.id;
            // reply.user_name = user.name;
            // reply.user_description = user.description;
            // reply.user_initials = user.initials;
            // reply.user_picture = user.profile_picture;
        //   }
        // });
      });
    });
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

  // ########## RECIPIENT ##########

  saveRecipient(rollcall:Rollcall, recipient:Recipient):Promise<any> {
    recipient.organization_id = rollcall.organization_id;
    recipient.rollcall_id = rollcall.id;
    return this.saveModel(recipient);
  }

  getRecipients(rollcall:Rollcall, rollcall_ids:number[]=null):Promise<Recipient[]> {
    let where = { };
    if (rollcall) {
      where['rollcall_id'] = rollcall.id;
    }
    if (rollcall_ids) {
      where['rollcall_id'] = rollcall_ids;
    }
    let order = { };
    return this.getModels<Recipient>(new Recipient(), where, order);
  }

  getRecipient(id:number):Promise<Recipient> {
    let where = { id: id };
    return this.getModel<Recipient>(new Recipient(), where);
  }

  removeRecipient(recipient:Recipient):Promise<any> {
    let where = { id: recipient.id };
    return this.removeModel<Recipient>(new Recipient(), where);
  }

  removeRecipients(rollcall:Rollcall=null) {
    let where = { };
    if (rollcall) {
      where['rollcall_id'] = rollcall.id;
    }
    return this.removeModel<Recipient>(new Recipient(), where);
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

  // ########## NOTIFICATION ##########

  saveNotification(organization:Organization, notification:Notification):Promise<any> {
    notification.organization_id = organization.id;
    return this.saveModel(notification);
  }

  getNotifications(organization:Organization):Promise<Notification[]> {
    let where = { organization_id: organization.id };
    let order = { created_at: "DESC" };
    return this.getModels<Notification>(new Notification(), where, order);
  }

  getNotification(id:number):Promise<Notification> {
    let where = { id: id };
    return this.getModel<Notification>(new Notification(), where);
  }

  removeNotification(notification:Notification):Promise<any> {
    let where = { id: notification.id };
    return this.removeModel<Notification>(new Notification(), where);
  }

  removeNotifications(organization:Organization=null) {
    let where = { };
    if (organization) {
      where['organization_id'] = organization.id;
    }
    return this.removeModel<Notification>(new Notification(), where);
  }

  // ########## GROUP ##########

  saveGroup(organization:Organization, group:Group):Promise<any> {
    group.organization_id = organization.id;
    return this.saveModel(group);
  }

  getGroups(organization:Organization):Promise<Group[]> {
    let where = { organization_id: organization.id };
    let order = { name: "ASC" };
    return this.getModels<Group>(new Group(), where, order);
  }

  getGroup(id:number):Promise<Group> {
    let where = { id: id };
    return this.getModel<Group>(new Group(), where);
  }

  removeGroup(group:Group):Promise<any> {
    let where = { id: group.id };
    return this.removeModel<Group>(new Group(), where);
  }

  removeGroups(organization:Organization=null) {
    let where = { };
    if (organization) {
      where['organization_id'] = organization.id;
    }
    return this.removeModel<Group>(new Group(), where);
  }

  // ########## SETTINGS ##########

  saveSettings(organization:Organization, settings:Settings):Promise<any> {
    settings.organization_id = organization.id;
    return this.saveModel(settings);
  }

  getSettings(organization:Organization):Promise<Settings[]> {
    let where = { organization_id: organization.id };
    let order = { key: "ASC" };
    return this.getModels<Settings>(new Settings(), where, order);
  }

  getSetting(id:number):Promise<Settings> {
    let where = { id: id };
    return this.getModel<Settings>(new Settings(), where);
  }

  removeSetting(settings:Settings):Promise<any> {
    let where = { id: settings.id };
    return this.removeModel<Settings>(new Settings(), where);
  }

  removeSettings(organization:Organization=null) {
    let where = { };
    if (organization) {
      where['organization_id'] = organization.id;
    }
    return this.removeModel<Settings>(new Settings(), where);
  }

  // ########## SUBSCRIPTIONS ##########

  saveSubscription(organization:Organization, subscription:Subscription):Promise<any> {
    subscription.organization_id = organization.id;
    return this.saveModel(subscription);
  }

  getSubscriptions(organization:Organization):Promise<Subscription[]> {
    let where = { organization_id: organization.id };
    let order = { created_at: "ASC" };
    return this.getModels<Subscription>(new Subscription(), where, order);
  }

  getSubscription(id:number):Promise<Subscription> {
    let where = { id: id };
    return this.getModel<Subscription>(new Subscription(), where);
  }

  removeSubscription(subscription:Settings):Promise<any> {
    let where = { id: subscription.id };
    return this.removeModel<Subscription>(new Subscription(), where);
  }

  removeSubscriptions(organization:Organization=null) {
    let where = { };
    if (organization) {
      where['organization_id'] = organization.id;
    }
    return this.removeModel<Subscription>(new Subscription(), where);
  }

}
