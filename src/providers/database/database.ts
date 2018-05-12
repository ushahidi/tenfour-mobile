import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SQLite } from '@ionic-native/sqlite';

import { SqlProvider } from '../../providers/sql/sql';
import { LoggerProvider } from '../../providers/logger/logger';

import { Email } from '../../models/email';
import { Person } from '../../models/person';
import { Contact } from '../../models/contact';
import { Checkin } from '../../models/checkin';
import { Organization } from '../../models/organization';
import { Answer } from '../../models/answer';
import { Reply } from '../../models/reply';
import { Recipient } from '../../models/recipient';
import { Group } from '../../models/group';
import { Settings } from '../../models/settings';
import { Country } from '../../models/country';
import { Subscription } from '../../models/subscription';
import { Notification } from '../../models/notification';

@Injectable()
export class DatabaseProvider extends SqlProvider {

  constructor(
    protected sqlite:SQLite,
    protected platform:Platform,
    protected logger:LoggerProvider) {
    super(sqlite, platform, logger);
  }

  // ########## ORGANIZATION ##########

  public saveOrganization(organization:Organization):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.saveModel(organization).then((saved:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public getOrganizations(where:{}=null, order:{}=null, limit:number=null, offset:number=null):Promise<Organization[]> {
    return new Promise((resolve, reject) => {
      this.getModels<Organization>(new Organization(), where, order, limit, offset).then((organizations:Organization[]) => {
        resolve(organizations);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  public getOrganization(id:number):Promise<Organization> {
    return new Promise((resolve, reject) => {
      let where = { id: id };
      this.getModel<Organization>(new Organization(), where).then((organization:Organization) => {
        resolve(organization);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  public removeOrganization(organization:Organization):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = { id: organization.id };
      this.removeModel<Organization>(new Organization(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public removeOrganizations():Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = { };
      this.removeModel<Organization>(new Organization(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  // ########## PERSON ##########

  public savePeople(organization:Organization, people:Person[]):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let saves = [];
      for (let person of people) {
        saves.push(this.savePerson(organization, person));
      }
      Promise.all(saves).then((saved:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public savePerson(organization:Organization, person:Person):Promise<boolean> {
    return new Promise((resolve, reject) => {
      person.organization_id = organization.id;
      this.saveModel(person).then((saved:any) => {
        let saves = [];
        for (let contact of person.contacts) {
          saves.push(this.saveContact(organization, person, contact));
        }
        Promise.all(saves).then(saved => {
          resolve(true);
        },
        (error:any) => {
          resolve(false);
        });
      },
      (error:any) => {
        resolve(false);
      });
    });
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

  public removePerson(organization:Organization, person:Person):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = {
        organization_id: organization.id,
        id: person.id
      };
      this.removeModel<Person>(new Person(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public removePeople(organization:Organization=null):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = { };
      if (organization) {
        where['organization_id'] = organization.id;
      }
      this.removeModel<Person>(new Person(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  // ########## CONTACT ##########

  public saveContacts(organization:Organization, person:Person, contacts:Contact[]):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let saves = [];
      for (let contact of contacts) {
        saves.push(this.saveContact(organization, person, contact));
      }
      Promise.all(saves).then((saved:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public saveContact(organization:Organization, person:Person, contact:Contact):Promise<boolean> {
    return new Promise((resolve, reject) => {
      contact.organization_id = organization.id;
      contact.person_id = person.id;
      this.saveModel(contact).then((saved:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public getContacts(organization:Organization, person:Person, people_ids:number[]=null, limit:number=null, offset:number=null):Promise<Contact[]> {
    return new Promise((resolve, reject) => {
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
      this.getModels<Contact>(new Contact(), where, order, limit, offset).then((contacts:Contact[]) => {
        resolve(contacts);
      },
      (error:any) => {
        reject(error);
      })
    });
  }

  public getContact(organization:Organization, id:number):Promise<Contact> {
    return new Promise((resolve, reject) => {
      let where = {
        organization_id: organization.id,
        id: id
      };
      this.getModel<Contact>(new Contact(), where).then((contact:Contact) => {
        resolve(contact);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  public removeContact(organization:Organization, contact:Contact):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = {
        organization_id : organization.id,
        id: contact.id
      };
      this.removeModel<Contact>(new Contact(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public removeContacts(organization:Organization=null, person:Person=null):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = { };
      if (organization) {
        where['organization_id'] = organization.id;
      }
      if (person) {
        where['person_id'] = person.id;
      }
      this.removeModel<Contact>(new Contact(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  // ########## CHECKIN ##########

  public saveCheckins(organization:Organization, checkins:Checkin[]):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let saves = [];
      for (let checkin of checkins) {
        saves.push(this.saveCheckin(organization, checkin));
      }
      Promise.all(saves).then((saved:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public saveCheckin(organization:Organization, checkin:Checkin):Promise<boolean> {
    return new Promise((resolve, reject) => {
      checkin.organization_id = organization.id;
      this.saveModel(checkin).then((saved:any) => {
        let saves = [];
        for (let answer of checkin.answers) {
          saves.push(this.saveAnswer(organization, checkin, answer));
        }
        for (let recipient of checkin.recipients) {
          saves.push(this.saveRecipient(organization, checkin, recipient));
        }
        for (let reply of checkin.replies) {
          saves.push(this.saveReply(organization, checkin, reply));
        }
        saves.push(this.saveCheckin(organization, checkin));
        Promise.all(saves).then((saved:any) => {
          resolve(true);
        },
        (error:any) => {
          resolve(false);
        });
      },
      (error:any) => {
        reject(false);
      });
    });
  }

  public getCheckins(organization:Organization, limit:number=null, offset:number=null):Promise<Checkin[]> {
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
        },
        (error:any) => {
          reject(error);
        });
      });
    });
  }

  public getCheckinsForPerson(organization:Organization, person:Person, limit:number=null, offset:number=null):Promise<Checkin[]> {
    return new Promise((resolve, reject) => {
      let order = { created_at: "DESC" };
      this.getModels<Reply>(new Reply(), { organization_id: organization.id, user_id: person.id }, order).then((replies:Reply[]) => {
        let checkin_ids = replies.map((reply) => reply.checkin_id);
        this.getModels<Checkin>(new Checkin(), { organization_id: organization.id, id: checkin_ids }, order, limit, offset).then((checkins:Checkin[]) => {
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
          },
          (error:any) => {
            reject(error);
          });
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

  public getCheckinsWaiting(organization:Organization, limit:number=null, offset:number=null):Promise<Checkin[]> {
    return new Promise((resolve, reject) => {
      let where = {
        organization_id: organization.id,
        waiting_count: "> 0"
      };
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
        },
        (error:any) => {
          resolve(checkins);
        });
      },
      (error:any) => {
        resolve([]);
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

  public removeCheckin(organization:Organization, checkin:Checkin):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = {
        organization_id: organization.id,
        id: checkin.id
      };
      this.removeModel<Checkin>(new Checkin(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public removeCheckins(organization:Organization=null):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = { };
      if (organization) {
        where['organization_id'] = organization.id;
      }
      this.removeModel<Checkin>(new Checkin(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  // ########## ANSWER ##########

  public saveAnswers(organization:Organization, checkin:Checkin, answers:Answer[]):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let saves = [];
      for (let answer of answers) {
        saves.push(this.saveAnswer(organization, checkin, answer));
      }
      Promise.all(saves).then((saved:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public saveAnswer(organization:Organization, checkin:Checkin, answer:Answer):Promise<boolean> {
    return new Promise((resolve, reject) => {
      answer.organization_id = organization.id;
      answer.checkin_id = checkin.id;
      this.saveModel(answer).then((saved:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public getAnswers(organization:Organization, checkin:Checkin, checkin_ids:number[]=null, limit:number=null, offset:number=null):Promise<Answer[]> {
    return new Promise((resolve, reject) => {
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
      this.getModels<Answer>(new Answer(), where, order, limit, offset).then((answers:Answer[]) => {
        resolve(answers);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  public getAnswer(organization:Organization, id:number):Promise<Answer> {
    return new Promise((resolve, reject) => {
      let where = {
        organization_id: organization.id,
        id: id
      };
      this.getModel<Answer>(new Answer(), where).then((answer:Answer) => {
        resolve(answer);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  public removeAnswer(organization:Organization, answer:Answer):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = {
        organization_id: organization.id,
        id: answer.id
      };
      this.removeModel<Answer>(new Answer(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public removeAnswers(organization:Organization=null, checkin:Checkin=null):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = { };
      if (organization) {
        where['organization_id'] = organization.id;
      }
      if (checkin) {
        where['checkin_id'] = checkin.id;
      }
      this.removeModel<Answer>(new Answer(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  // ########## REPLY ##########

  public saveReplies(organization:Organization, checkin:Checkin, replies:Reply[]):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let saves = [];
      for (let reply of replies) {
        saves.push(this.saveReply(organization, checkin, reply));
      }
      Promise.all(saves).then((saved:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public saveReply(organization:Organization, checkin:Checkin, reply:Reply):Promise<boolean> {
    return new Promise((resolve, reject) => {
      reply.organization_id = organization.id;
      reply.checkin_id = checkin.id;
      this.saveModel(reply).then((saved:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
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

  public getReply(organization:Organization, id:number):Promise<Reply> {
    return new Promise((resolve, reject) => {
      let where = {
        organization_id: organization.id,
        id: id
      };
      this.getModel<Reply>(new Reply(), where).then((reply:Reply) => {
        resolve(reply);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  public removeReply(organization:Organization, reply:Reply):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = {
        organization_id: organization.id,
        id: reply.id
      };
      this.removeModel<Reply>(new Reply(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public removeReplies(organization:Organization=null, checkin:Checkin=null):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = { };
      if (organization) {
        where['organization_id'] = organization.id;
      }
      if (checkin) {
        where['checkin_id'] = checkin.id;
      }
      this.removeModel<Reply>(new Reply(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  // ########## RECIPIENT ##########

  public saveRecipients(organization:Organization, checkin:Checkin, recipients:Recipient[]):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let saves = [];
      for (let recipient of recipients) {
        saves.push(this.saveRecipient(organization, checkin, recipient));
      }
      Promise.all(saves).then((saved:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public saveRecipient(organization:Organization, checkin:Checkin, recipient:Recipient):Promise<boolean> {
    return new Promise((resolve, reject) => {
      recipient.checkin_id = checkin.id;
      recipient.organization_id = organization.id;
      this.saveModel(recipient).then((saved:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public getRecipients(organization:Organization, checkin:Checkin, checkin_ids:number[]=null, limit:number=null, offset:number=null):Promise<Recipient[]> {
    return new Promise((resolve, reject) => {
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
      this.getModels<Recipient>(new Recipient(), where, order, limit, offset).then((recipients:Recipient[]) => {
        resolve(recipients);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  public getRecipient(organization:Organization, id:number):Promise<Recipient> {
    return new Promise((resolve, reject) => {
      let where = {
        organization_id: organization.id,
        id: id
      };
      this.getModel<Recipient>(new Recipient(), where).then((recipient:Recipient) => {
        resolve(recipient);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  public removeRecipient(organization:Organization, recipient:Recipient):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = {
        organization_id: organization.id,
        id: recipient.id
      };
      this.removeModel<Recipient>(new Recipient(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public removeRecipients(organization:Organization=null, checkin:Checkin=null):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = { };
      if (organization) {
        where['organization_id'] = organization.id;
      }
      if (checkin) {
        where['checkin_id'] = checkin.id;
      }
      this.removeModel<Recipient>(new Recipient(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  // ########## EMAIL ##########

  public saveEmails(organization:Organization, emails:Email[]):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let saves = [];
      for (let email of emails) {
        saves.push(this.saveEmail(organization, email));
      }
      Promise.all(saves).then((saved:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public saveEmail(organization:Organization, email:Email):Promise<boolean> {
    return new Promise((resolve, reject) => {
      email.organization_id = organization.id;
      this.saveModel(email).then((saved:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public getEmails(organization:Organization, limit:number=null, offset:number=null):Promise<Email[]> {
    return new Promise((resolve, reject) => {
      let where = { organization_id: organization.id };
      let order = { };
      this.getModels<Email>(new Email(), where, order, limit, offset).then((emails:Email[]) => {
        resolve(emails);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  public getEmail(organization:Organization, id:number):Promise<Email> {
    return new Promise((resolve, reject) => {
      let where = {
        organization_id: organization.id,
        id: id
      };
      this.getModel<Email>(new Email(), where).then((email:Email) => {
        resolve(email);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  public removeEmail(organization:Organization, email:Email):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = {
        organization_id: organization.id,
        id: email.id
      };
      this.removeModel<Email>(new Email(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public removeEmails(organization:Organization=null):Promise<boolean>{
    return new Promise((resolve, reject) => {
      let where = { };
      if (organization) {
        where['organization_id'] = organization.id;
      }
      this.removeModel<Email>(new Email(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  // ########## NOTIFICATION ##########

  public saveNotifications(organization:Organization, notifications:Notification[]):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let saves = [];
      for (let notification of notifications) {
        saves.push(this.saveNotification(organization, notification));
      }
      Promise.all(saves).then(saved => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public saveNotification(organization:Organization, notification:Notification):Promise<boolean> {
    return new Promise((resolve, reject) => {
      notification.organization_id = organization.id;
      this.saveModel(notification, false).then((saved:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public getNotifications(organization:Organization, limit:number=null, offset:number=null):Promise<Notification[]> {
    return new Promise((resolve, reject) => {
      let where = { organization_id: organization.id };
      let order = { created_at: "DESC" };
      this.getModels<Notification>(new Notification(), where, order, limit, offset).then((notifications:Notification[]) => {
        resolve(notifications);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  public getNotification(organization:Organization, id:number):Promise<Notification> {
    return new Promise((resolve, reject) => {
      let where = {
        organization_id: organization.id,
        id: id
      };
      this.getModel<Notification>(new Notification(), where).then((notification:Notification) => {
        resolve(notification);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  public removeNotification(organization:Organization, notification:Notification):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = {
        organization_id: organization.id,
        id: notification.id
      };
      this.removeModel<Notification>(new Notification(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public removeNotifications(organization:Organization=null):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = { };
      if (organization) {
        where['organization_id'] = organization.id;
      }
      this.removeModel<Notification>(new Notification(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  // ########## GROUP ##########

  public saveGroups(organization:Organization, groups:Group[]):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let saves = [];
      for (let group of groups) {
        saves.push(this.saveGroup(organization, group));
      }
      Promise.all(saves).then((saved:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      })
    });
  }

  public saveGroup(organization:Organization, group:Group):Promise<boolean> {
    return new Promise((resolve, reject) => {
      group.organization_id = organization.id;
      this.saveModel(group).then((saved:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
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
        },
        (error:any) => {
          resolve([]);
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

  public removeGroup(organization:Organization, group:Group):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = {
        organization_id: organization.id,
        id: group.id
      };
      this.removeModel<Group>(new Group(), where);
    });
  }

  public removeGroups(organization:Organization=null):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = { };
      if (organization) {
        where['organization_id'] = organization.id;
      }
      this.removeModel<Group>(new Group(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  // ########## SETTINGS ##########

  public saveSettings(organization:Organization, settings:Settings):Promise<boolean> {
    return new Promise((resolve, reject) => {
      settings.organization_id = organization.id;
      this.saveModel(settings).then((saved:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public getSettings(organization:Organization):Promise<Settings[]> {
    return new Promise((resolve, reject) => {
      let where = { organization_id: organization.id };
      let order = { key: "ASC" };
      this.getModels<Settings>(new Settings(), where, order).then((settings:Settings[]) => {
        resolve(settings);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  public getSetting(organization:Organization, id:number):Promise<Settings> {
    return new Promise((resolve, reject) => {
      let where = {
        organization_id: organization.id,
        id: id
      };
      this.getModel<Settings>(new Settings(), where).then((settings:Settings) => {
        resolve(settings);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  public removeSetting(organization:Organization, settings:Settings):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = {
        organization_id: organization.id,
        id: settings.id
      };
      this.removeModel<Settings>(new Settings(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public removeSettings(organization:Organization=null):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = { };
      if (organization) {
        where['organization_id'] = organization.id;
      }
      this.removeModel<Settings>(new Settings(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  // ########## SUBSCRIPTIONS ##########

  public saveSubscription(organization:Organization, subscription:Subscription):Promise<boolean> {
    return new Promise((resolve, reject) => {
      subscription.organization_id = organization.id;
      this.saveModel(subscription).then((saved:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public getSubscriptions(organization:Organization, limit:number=null, offset:number=null):Promise<Subscription[]> {
    return new Promise((resolve, reject) => {
      let where = { organization_id: organization.id };
      let order = { created_at: "ASC" };
      this.getModels<Subscription>(new Subscription(), where, order, limit, offset).then((subscriptions:Subscription[]) => {
        resolve(subscriptions);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  public getSubscription(organization:Organization, id:number):Promise<Subscription> {
    return new Promise((resolve, reject) => {
      let where = {
        organization_id: organization.id,
        id: id
      };
      this.getModel<Subscription>(new Subscription(), where).then((subscription:Subscription) => {
        resolve(subscription);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  public removeSubscription(organization:Organization, subscription:Subscription):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = {
        organization_id: organization.id,
        id: subscription.id
      };
      this.removeModel<Subscription>(new Subscription(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public removeSubscriptions(organization:Organization=null):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = { };
      if (organization) {
        where['organization_id'] = organization.id;
      }
      this.removeModel<Subscription>(new Subscription(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  // ########## COUNTRIES ##########

  public saveCountries(organization:Organization, countries:Country[]):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let saves = [];
      for (let country of countries) {
        if (organization.regions) {
          let codes = organization.regions.split(",");
          country.selected = codes.indexOf(country.code) != -1;
        }
        else {
          country.selected = false;
        }
        saves.push(this.saveCountry(organization, country));
      }
      Promise.all(saves).then((saved:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      })
    });
  }

  public saveCountry(organization:Organization, country:Country):Promise<boolean> {
    return new Promise((resolve, reject) => {
      country.organization_id = organization.id;
      this.saveModel(country).then((saved:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public getCountries(organization:Organization, limit:number=null, offset:number=null):Promise<Country[]> {
    return new Promise((resolve, reject) => {
      let where = { organization_id: organization.id };
      let order = { created_at: "ASC" };
      this.getModels<Country>(new Country(), where, order, limit, offset).then((countries:Country[]) => {
        resolve(countries);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  public getCountry(organization:Organization, id:number):Promise<Country> {
    return new Promise((resolve, reject) => {
      let where = {
        organization_id: organization.id,
        id: id
      };
      this.getModel<Country>(new Country(), where).then((country:Country) => {
        resolve(country);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  public removeCountry(organization:Organization, region:Country):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = {
        organization_id: organization.id,
        id: region.id
      };
      this.removeModel<Country>(new Country(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public removeCountries(organization:Organization=null):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = { };
      if (organization) {
        where['organization_id'] = organization.id;
      }
      this.removeModel<Country>(new Country(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

}