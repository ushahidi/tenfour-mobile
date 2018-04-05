import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SQLite } from '@ionic-native/sqlite';

import { SqlService } from '../providers/sql-service';
import { LoggerService } from '../providers/logger-service';

import { Email } from '../models/email';
import { Person } from '../models/person';
import { Contact } from '../models/contact';
import { Checkin } from '../models/checkin';
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
        this.getContacts(organization, null, people_ids).then((contacts:Contact[]) => {
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

  public getPerson(organization:Organization, id:number, me:boolean=false):Promise<Person> {
    return new Promise((resolve, reject) => {
      let where = { };
      if (organization) {
        where['organization_id'] = organization.id;
      }
      if (id) {
        where["id"] = id;
      }
      if (me) {
        where["me"] = true;
      }
      this.getModel<Person>(new Person(), where).then((person:Person) => {
        this.getContacts(organization, person).then((contacts:Contact[]) => {
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

  public removePerson(organization:Organization, person:Person):Promise<any> {
    let where = {
      organization_id: organization.id,
      id: person.id
    };
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

  public saveContact(organization:Organization, person:Person, contact:Contact):Promise<any> {
    contact.organization_id = organization.id;
    contact.person_id = person.id;
    return this.saveModel(contact);
  }

  public getContacts(organization:Organization, person:Person, people_ids:number[]=null, limit:number=null, offset:number=null):Promise<Contact[]> {
    let where = { };
    if (organization) {
      where['organization_id'] = organization.id;
    }
    if (person) {
      where['id'] = person.id;
    }
    if (people_ids) {
      where['person_id'] = people_ids;
    }
    let order = { };
    return this.getModels<Contact>(new Contact(), where, order, limit, offset);
  }

  public getContact(organization:Organization, id:number):Promise<Contact> {
    let where = {
      organization_id: organization.id,
      id: id
    };
    return this.getModel<Contact>(new Contact(), where);
  }

  public removeContact(organization:Organization, contact:Contact):Promise<any> {
    let where = {
      organization_id : organization.id,
      id: contact.id
    };
    return this.removeModel<Contact>(new Contact(), where);
  }

  public removeContacts(organization:Organization=null, person:Person=null) {
    let where = { };
    if (organization) {
      where['organization_id'] = organization.id;
    }
    if (person) {
      where['person_id'] = person.id;
    }
    return this.removeModel<Contact>(new Contact(), where);
  }

  // ########## CHECKIN ##########

  public saveCheckin(organization:Organization, checkin:Checkin):Promise<any> {
    checkin.organization_id = organization.id;
    return this.saveModel(checkin);
  }

  getCheckins(organization:Organization, limit:number=null, offset:number=null):Promise<Checkin[]> {
    return new Promise((resolve, reject) => {
      let where = { organization_id: organization.id };
      let order = { created_at: "DESC" };
      this.getModels<Checkin>(new Checkin(), where, order, limit, offset).then((checkins:Checkin[]) => {
        let checkin_ids = checkins.map((checkin:Checkin) => checkin.id);
        this.logger.info(this, "getCheckins", "IDs", checkin_ids);
        Promise.all([
          this.getAnswers(organization, null, checkin_ids),
          this.getReplies(organization, null, checkin_ids),
          this.getRecipients(organization, null, checkin_ids)]).then((results:any[]) => {
            let answers = <Answer[]>results[0];
            let replies = <Reply[]>results[1];
            let recipients = <Recipient[]>results[2];
            for (let checkin of checkins) {
              checkin.answers = answers.filter(answer => answer.checkin_id == checkin.id);
              checkin.replies = replies.filter(reply => reply.checkin_id == checkin.id);
              checkin.recipients = recipients.filter(recipient => recipient.checkin_id == checkin.id);
            }
            resolve(checkins);
        });
      });
    });
  }

  public getCheckin(organization:Organization, id:number):Promise<Checkin> {
    return new Promise((resolve, reject) => {
      let where = { id: id };
      this.getModel<Checkin>(new Checkin(), where).then((checkin:Checkin) => {
        Promise.all([
          this.getAnswers(organization, checkin),
          this.getReplies(organization, checkin),
          this.getRecipients(organization, checkin)]).then((results:any[]) => {
            checkin.answers = <Answer[]>results[0];
            checkin.replies = <Reply[]>results[1];
            checkin.recipients = <Recipient[]>results[2];
            resolve(checkin);
        });
      });
    });
  }

  public removeCheckin(organization:Organization, checkin:Checkin):Promise<any> {
    let where = {
      organization_id: organization.id,
      id: checkin.id
    };
    return this.removeModel<Checkin>(new Checkin(), where);
  }

  public removeCheckins(organization:Organization=null) {
    let where = { };
    if (organization) {
      where['organization_id'] = organization.id;
    }
    return this.removeModel<Checkin>(new Checkin(), where);
  }

  // ########## ANSWER ##########

  public saveAnswer(organization:Organization, checkin:Checkin, answer:Answer):Promise<any> {
    answer.organization_id = organization.id;
    answer.checkin_id = checkin.id;
    return this.saveModel(answer);
  }

  public getAnswers(organization:Organization, checkin:Checkin, checkin_ids:number[]=null, limit:number=null, offset:number=null):Promise<Answer[]> {
    let where = { };
    if (organization) {
      where['organization_id'] = organization.id;
    }
    if (checkin) {
      where['checkin_id'] = checkin.id;
    }
    if (checkin_ids) {
      where['checkin_id'] = checkin_ids;
    }
    let order = { };
    return this.getModels<Answer>(new Answer(), where, order, limit, offset);
  }

  public getAnswer(organization:Organization, id:number):Promise<Answer> {
    let where = {
      organization_id: organization.id,
      id: id
    };
    return this.getModel<Answer>(new Answer(), where);
  }

  public removeAnswer(organization:Organization, answer:Answer):Promise<any> {
    let where = {
      organization_id: organization.id,
      id: answer.id
    };
    return this.removeModel<Answer>(new Answer(), where);
  }

  public removeAnswers(organization:Organization=null, checkin:Checkin=null) {
    let where = { };
    if (organization) {
      where['organization_id'] = organization.id;
    }
    if (checkin) {
      where['checkin_id'] = checkin.id;
    }
    return this.removeModel<Answer>(new Answer(), where);
  }

  // ########## REPLY ##########

  public saveReply(organization:Organization, checkin:Checkin, reply:Reply):Promise<any> {
    reply.organization_id = organization.id;
    reply.checkin_id = checkin.id;
    return this.saveModel(reply);
  }

  public getReplies(organization:Organization, checkin:Checkin, checkin_ids:number[]=null, limit:number=null, offset:number=null):Promise<Reply[]> {
    return new Promise((resolve, reject) => {
      let where = { };
      if (checkin) {
        where['checkin_id'] = checkin.id;
      }
      if (checkin_ids) {
        where['checkin_id'] = checkin_ids;
      }
      let order = {  created_at: "DESC" };
      this.getModels<Reply>(new Reply(), where, order, limit, offset).then((replies:Reply[]) => {
        let user_ids = replies.map((reply) => reply.user_id);
        this.getPeople(organization, user_ids).then((people:Person[]) => {
          for (let reply of replies) {
            let user = people.find(user => user.id == reply.user_id);
            if (user) {
              reply.user_id = user.id;
              reply.user_name = user.name;
              reply.user_description = user.description;
              reply.user_initials = user.initials;
              reply.user_picture = user.profile_picture;
            }
          }
          resolve(replies);
        });
      });
    });
  }

  public getReply(organization:Organization, id:number):Promise<Reply> {
    let where = {
      organization_id: organization.id,
      id: id
    };
    return this.getModel<Reply>(new Reply(), where);
  }

  public removeReply(organization:Organization, reply:Reply):Promise<any> {
    let where = {
      organization_id: organization.id,
      id: reply.id
    };
    return this.removeModel<Reply>(new Reply(), where);
  }

  public removeReplies(organization:Organization=null, checkin:Checkin=null) {
    let where = { };
    if (organization) {
      where['organization_id'] = organization.id;
    }
    if (checkin) {
      where['checkin_id'] = checkin.id;
    }
    return this.removeModel<Reply>(new Reply(), where);
  }

  // ########## RECIPIENT ##########

  public saveRecipient(organization:Organization, checkin:Checkin, recipient:Recipient):Promise<any> {
    recipient.checkin_id = checkin.id;
    recipient.organization_id = organization.id;
    return this.saveModel(recipient);
  }

  public getRecipients(organization:Organization, checkin:Checkin, checkin_ids:number[]=null, limit:number=null, offset:number=null):Promise<Recipient[]> {
    let where = { };
    if (organization) {
      where['organization_id'] = organization.id;
    }
    if (checkin) {
      where['checkin_id'] = checkin.id;
    }
    if (checkin_ids) {
      where['checkin_id'] = checkin_ids;
    }
    let order = { };
    return this.getModels<Recipient>(new Recipient(), where, order, limit, offset);
  }

  public getRecipient(organization:Organization, id:number):Promise<Recipient> {
    let where = {
      organization_id: organization.id,
      id: id
    };
    return this.getModel<Recipient>(new Recipient(), where);
  }

  public removeRecipient(organization:Organization, recipient:Recipient):Promise<any> {
    let where = {
      organization_id: organization.id,
      id: recipient.id
    };
    return this.removeModel<Recipient>(new Recipient(), where);
  }

  public removeRecipients(organization:Organization=null, checkin:Checkin=null) {
    let where = { };
    if (organization) {
      where['organization_id'] = organization.id;
    }
    if (checkin) {
      where['checkin_id'] = checkin.id;
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

  public getEmail(organization:Organization, id:number):Promise<Email> {
    let where = {
      organization_id: organization.id,
      id: id
    };
    return this.getModel<Email>(new Email(), where);
  }

  public removeEmail(organization:Organization, email:Email):Promise<any> {
    let where = {
      organization_id: organization.id,
      id: email.id
    };
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

  public getNotification(organization:Organization, id:number):Promise<Notification> {
    let where = {
      organization_id: organization.id,
      id: id
    };
    return this.getModel<Notification>(new Notification(), where);
  }

  public removeNotification(organization:Organization, notification:Notification):Promise<any> {
    let where = {
      organization_id: organization.id,
      id: notification.id
    };
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

  public removeGroup(organization:Organization, group:Group):Promise<any> {
    let where = {
      organization_id: organization.id,
      id: group.id
    };
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

  public getSetting(organization:Organization, id:number):Promise<Settings> {
    let where = {
      organization_id: organization.id,
      id: id
    };
    return this.getModel<Settings>(new Settings(), where);
  }

  public removeSetting(organization:Organization, settings:Settings):Promise<any> {
    let where = {
      organization_id: organization.id,
      id: settings.id
    };
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

  public getSubscription(organization:Organization, id:number):Promise<Subscription> {
    let where = {
      organization_id: organization.id,
      id: id
    };
    return this.getModel<Subscription>(new Subscription(), where);
  }

  public removeSubscription(organization:Organization, subscription:Subscription):Promise<any> {
    let where = {
      organization_id: organization.id,
      id: subscription.id
    };
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

  public getCountry(organization:Organization, id:number):Promise<Country> {
    let where = {
      organization_id: organization.id,
      id: id
    };
    return this.getModel<Country>(new Country(), where);
  }

  public removeCountry(organization:Organization, region:Country):Promise<any> {
    let where = {
      organization_id: organization.id,
      id: region.id
    };
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
