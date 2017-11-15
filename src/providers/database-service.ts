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
import { Country } from '../models/country';
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

  public saveOrganization(organization:Organization):Promise<boolean> {
    return this.saveModel(organization);
  }

  public getOrganizations(where:{}=null, order:{}=null, limit:number=null, offset:number=null):Promise<Organization[]> {
    return this.getModels<Organization>(new Organization(), where, order, limit, offset);
  }

  public getOrganization(id:number):Promise<Organization> {
    let where = { id: id };
    return this.getModel<Organization>(new Organization(), where);
  }

  public removeOrganization(organization:Organization):Promise<any> {
    let where = { id: organization.id };
    return this.removeModel<Organization>(new Organization(), where);
  }

  public removeOrganizations():Promise<any> {
    let where = { };
    return this.removeModel<Organization>(new Organization(), where);
  }

  // ########## PERSON ##########

  public savePerson(organization:Organization, person:Person):Promise<any> {
    person.organization_id = organization.id;
    return this.saveModel(person);
  }

  public getPeople(organization:Organization, ids:number[]=null, limit:number=null, offset:number=null):Promise<Person[]> {
    return new Promise((resolve, reject) => {
      let where = { };
      if (organization) {
        where["organization_id"] = organization.id;
      }
      if (ids) {
        where["id"] = ids;
      }
      let order = { name: "ASC" };
      this.getModels<Person>(new Person(), where, order, limit, offset).then((people:Person[]) => {
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

  public getPerson(id:number, me:boolean=false):Promise<Person> {
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

  public removePerson(person:Person):Promise<any> {
    let where = { id: person.id };
    return this.removeModel<Person>(new Person(), where);
  }

  public removePeople(organization:Organization=null) {
    let where = { };
    if (organization) {
      where['organization_id'] = organization.id;
    }
    return this.removeModel<Person>(new Person(), where);
  }

  // ########## CONTACT ##########

  public saveContact(person:Person, contact:Contact):Promise<any> {
    contact.organization_id = person.organization_id;
    contact.person_id = person.id;
    return this.saveModel(contact);
  }

  public getContacts(person:Person, people_ids:number[]=null, limit:number=null, offset:number=null):Promise<Contact[]> {
    let where = { };
    if (person) {
      where['id'] = person.id;
    }
    if (people_ids) {
      where['person_id'] = people_ids;
    }
    let order = { };
    return this.getModels<Contact>(new Contact(), where, order, limit, offset);
  }

  public getContact(id:number):Promise<Contact> {
    let where = { id: id };
    return this.getModel<Contact>(new Contact(), where);
  }

  public removeContact(contact:Contact):Promise<any> {
    let where = { id: contact.id };
    return this.removeModel<Contact>(new Contact(), where);
  }

  public removeContacts(person:Person=null) {
    let where = { };
    if (person) {
      where['person_id'] = person.id;
    }
    return this.removeModel<Contact>(new Contact(), where);
  }

  // ########## ROLLCALL ##########

  public saveRollcall(organization:Organization, rollcall:Rollcall):Promise<any> {
    rollcall.organization_id = organization.id;
    return this.saveModel(rollcall);
  }

  getRollcalls(organization:Organization, limit:number=null, offset:number=null):Promise<Rollcall[]> {
    return new Promise((resolve, reject) => {
      let where = { organization_id: organization.id };
      let order = { created_at: "DESC" };
      this.getModels<Rollcall>(new Rollcall(), where, order, limit, offset).then((rollcalls:Rollcall[]) => {
        let rollcall_ids = rollcalls.map((rollcall:Rollcall) => rollcall.id);
        this.logger.info(this, "getRollcalls", "IDs", rollcall_ids);
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
      });
    });
  }

  public getRollcall(id:number):Promise<Rollcall> {
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

  public removeRollcall(rollcall:Rollcall):Promise<any> {
    let where = { id: rollcall.id };
    return this.removeModel<Rollcall>(new Rollcall(), where);
  }

  public removeRollcalls(organization:Organization=null) {
    let where = { };
    if (organization) {
      where['organization_id'] = organization.id;
    }
    return this.removeModel<Rollcall>(new Rollcall(), where);
  }

  // ########## ANSWER ##########

  public saveAnswer(rollcall:Rollcall, answer:Answer):Promise<any> {
    answer.organization_id = rollcall.organization_id;
    answer.rollcall_id = rollcall.id;
    return this.saveModel(answer);
  }

  public getAnswers(rollcall:Rollcall, rollcall_ids:number[]=null, limit:number=null, offset:number=null):Promise<Answer[]> {
    let where = { };
    if (rollcall) {
      where['rollcall_id'] = rollcall.id;
    }
    if (rollcall_ids) {
      where['rollcall_id'] = rollcall_ids;
    }
    let order = { };
    return this.getModels<Answer>(new Answer(), where, order, limit, offset);
  }

  public getAnswer(id:number):Promise<Answer> {
    let where = { id: id };
    return this.getModel<Answer>(new Answer(), where);
  }

  public removeAnswer(answer:Answer):Promise<any> {
    let where = { id: answer.id };
    return this.removeModel<Answer>(new Answer(), where);
  }

  public removeAnswers(rollcall:Rollcall=null) {
    let where = { };
    if (rollcall) {
      where['rollcall_id'] = rollcall.id;
    }
    return this.removeModel<Answer>(new Answer(), where);
  }

  // ########## REPLY ##########

  public saveReply(rollcall:Rollcall, reply:Reply):Promise<any> {
    reply.organization_id = rollcall.organization_id;
    reply.rollcall_id = rollcall.id;
    return this.saveModel(reply);
  }

  public getReplies(rollcall:Rollcall, rollcall_ids:number[]=null, limit:number=null, offset:number=null):Promise<Reply[]> {
    return new Promise((resolve, reject) => {
      let where = { };
      if (rollcall) {
        where['rollcall_id'] = rollcall.id;
      }
      if (rollcall_ids) {
        where['rollcall_id'] = rollcall_ids;
      }
      let order = {  created_at: "DESC" };
      this.getModels<Reply>(new Reply(), where, order, limit, offset).then((replies:Reply[]) => {
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

  public getReply(id:number):Promise<Reply> {
    let where = { id: id };
    return this.getModel<Reply>(new Reply(), where);
  }

  public removeReply(reply:Reply):Promise<any> {
    let where = { id: reply.id };
    return this.removeModel<Reply>(new Reply(), where);
  }

  public removeReplies(rollcall:Rollcall=null) {
    let where = { };
    if (rollcall) {
      where['rollcall_id'] = rollcall.id;
    }
    return this.removeModel<Reply>(new Reply(), where);
  }

  // ########## RECIPIENT ##########

  public saveRecipient(rollcall:Rollcall, recipient:Recipient):Promise<any> {
    recipient.rollcall_id = rollcall.id;
    recipient.organization_id = rollcall.organization_id;
    return this.saveModel(recipient);
  }

  public getRecipients(rollcall:Rollcall, rollcall_ids:number[]=null, limit:number=null, offset:number=null):Promise<Recipient[]> {
    let where = { };
    if (rollcall) {
      where['rollcall_id'] = rollcall.id;
    }
    if (rollcall_ids) {
      where['rollcall_id'] = rollcall_ids;
    }
    let order = { };
    return this.getModels<Recipient>(new Recipient(), where, order, limit, offset);
  }

  public getRecipient(id:number):Promise<Recipient> {
    let where = { id: id };
    return this.getModel<Recipient>(new Recipient(), where);
  }

  public removeRecipient(recipient:Recipient):Promise<any> {
    let where = { id: recipient.id };
    return this.removeModel<Recipient>(new Recipient(), where);
  }

  public removeRecipients(rollcall:Rollcall=null) {
    let where = { };
    if (rollcall) {
      where['rollcall_id'] = rollcall.id;
    }
    return this.removeModel<Recipient>(new Recipient(), where);
  }

  // ########## EMAIL ##########

  public saveEmail(organization:Organization, email:Email):Promise<any> {
    email.organization_id = organization.id;
    return this.saveModel(email);
  }

  public getEmails(organization:Organization, limit:number=null, offset:number=null):Promise<Email[]> {
    let where = { organization_id: organization.id };
    let order = { };
    return this.getModels<Email>(new Email(), where, order, limit, offset);
  }

  public getEmail(id:number):Promise<Email> {
    let where = { id: id };
    return this.getModel<Email>(new Email(), where);
  }

  public removeEmail(email:Email):Promise<any> {
    let where = { id: email.id };
    return this.removeModel<Email>(new Email(), where);
  }

  public removeEmails(organization:Organization=null) {
    let where = { };
    if (organization) {
      where['organization_id'] = organization.id;
    }
    return this.removeModel<Email>(new Email(), where);
  }

  // ########## NOTIFICATION ##########

  public saveNotification(organization:Organization, notification:Notification):Promise<any> {
    notification.organization_id = organization.id;
    return this.saveModel(notification, false);
  }

  public getNotifications(organization:Organization, limit:number=null, offset:number=null):Promise<Notification[]> {
    let where = { organization_id: organization.id };
    let order = { created_at: "DESC" };
    return this.getModels<Notification>(new Notification(), where, order, limit, offset);
  }

  public getNotification(id:number):Promise<Notification> {
    let where = { id: id };
    return this.getModel<Notification>(new Notification(), where);
  }

  public removeNotification(notification:Notification):Promise<any> {
    let where = { id: notification.id };
    return this.removeModel<Notification>(new Notification(), where);
  }

  public removeNotifications(organization:Organization=null) {
    let where = { };
    if (organization) {
      where['organization_id'] = organization.id;
    }
    return this.removeModel<Notification>(new Notification(), where);
  }

  // ########## GROUP ##########

  public saveGroup(organization:Organization, group:Group):Promise<any> {
    group.organization_id = organization.id;
    return this.saveModel(group);
  }

  public getGroups(organization:Organization, limit:number=null, offset:number=null):Promise<Group[]> {
    return new Promise((resolve, reject) => {
      let where = { organization_id: organization.id };
      let order = { name: "ASC" };
      Promise.all([
        this.getModels<Group>(new Group(), where, order, limit, offset),
        this.getPeople(organization)]).then((results:any[]) => {
          let groups = <Group[]>results[0];
          let people = <Person[]>results[1];
          for(let group of groups) {
            group.loadMembers(people);
          }
          resolve(groups);
      });
    });
  }

  public getGroup(organization:Organization, id:number):Promise<Group> {
    return new Promise((resolve, reject) => {
      let where = {
        organization_id: organization.id,
        id: id };
      this.getModel<Group>(new Group(), where).then((group:Group) => {
        if (group.member_ids) {
          let member_ids = group.member_ids.split(",").map(id => Number(id));
          this.getPeople(organization, member_ids).then((people:Person[]) => {
            group.members = people;
          });
        }
        resolve(group);
      });
    });
  }

  public removeGroup(group:Group):Promise<any> {
    let where = { id: group.id };
    return this.removeModel<Group>(new Group(), where);
  }

  public removeGroups(organization:Organization=null) {
    let where = { };
    if (organization) {
      where['organization_id'] = organization.id;
    }
    return this.removeModel<Group>(new Group(), where);
  }

  // ########## SETTINGS ##########

  public saveSettings(organization:Organization, settings:Settings):Promise<any> {
    settings.organization_id = organization.id;
    return this.saveModel(settings);
  }

  public getSettings(organization:Organization):Promise<Settings[]> {
    let where = { organization_id: organization.id };
    let order = { key: "ASC" };
    return this.getModels<Settings>(new Settings(), where, order);
  }

  public getSetting(id:number):Promise<Settings> {
    let where = { id: id };
    return this.getModel<Settings>(new Settings(), where);
  }

  public removeSetting(settings:Settings):Promise<any> {
    let where = { id: settings.id };
    return this.removeModel<Settings>(new Settings(), where);
  }

  public removeSettings(organization:Organization=null) {
    let where = { };
    if (organization) {
      where['organization_id'] = organization.id;
    }
    return this.removeModel<Settings>(new Settings(), where);
  }

  // ########## SUBSCRIPTIONS ##########

  public saveSubscription(organization:Organization, subscription:Subscription):Promise<any> {
    subscription.organization_id = organization.id;
    return this.saveModel(subscription);
  }

  public getSubscriptions(organization:Organization, limit:number=null, offset:number=null):Promise<Subscription[]> {
    let where = { organization_id: organization.id };
    let order = { created_at: "ASC" };
    return this.getModels<Subscription>(new Subscription(), where, order, limit, offset);
  }

  public getSubscription(id:number):Promise<Subscription> {
    let where = { id: id };
    return this.getModel<Subscription>(new Subscription(), where);
  }

  public removeSubscription(subscription:Subscription):Promise<any> {
    let where = { id: subscription.id };
    return this.removeModel<Subscription>(new Subscription(), where);
  }

  public removeSubscriptions(organization:Organization=null) {
    let where = { };
    if (organization) {
      where['organization_id'] = organization.id;
    }
    return this.removeModel<Subscription>(new Subscription(), where);
  }

  // ########## COUNTRIES ##########

  public saveCountry(organization:Organization, country:Country):Promise<any> {
    country.organization_id = organization.id;
    return this.saveModel(country);
  }

  public getCountries(organization:Organization, limit:number=null, offset:number=null):Promise<Country[]> {
    let where = { organization_id: organization.id };
    let order = { created_at: "ASC" };
    return this.getModels<Country>(new Country(), where, order, limit, offset);
  }

  public getCountry(id:number):Promise<Country> {
    let where = { id: id };
    return this.getModel<Country>(new Country(), where);
  }

  public removeCountry(region:Country):Promise<any> {
    let where = { id: region.id };
    return this.removeModel<Country>(new Country(), where);
  }

  public removeCountries(organization:Organization=null) {
    let where = { };
    if (organization) {
      where['organization_id'] = organization.id;
    }
    return this.removeModel<Country>(new Country(), where);
  }

}
