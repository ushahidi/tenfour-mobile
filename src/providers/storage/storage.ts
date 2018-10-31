import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { LocalStorageService } from 'ngx-localstorage';
import { NativeStorage } from '@ionic-native/native-storage';

import { Model } from '../../models/model';
import { Email } from '../../models/email';
import { User } from '../../models/user';
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

import { DatabaseProvider } from '../../providers/database/database';
import { WebstoreProvider } from '../../providers/webstore/webstore';
import { LoggerProvider } from '../../providers/logger/logger';

@Injectable()
export class StorageProvider {

  private provider:DatabaseProvider|WebstoreProvider;

  constructor(
    private platform:Platform,
    private webStorage:LocalStorageService,
    private nativeStorage:NativeStorage,
    private webstore:WebstoreProvider,
    private database:DatabaseProvider,
    private logger:LoggerProvider) {
    this.provider = this.webstore;
    this.platform.ready().then((ready) => {
      if (this.platform.is("cordova")) {
        this.provider = this.database;
      }
      else {
        this.provider = this.webstore;
      }
    });
  }

  // ########## HELPERS ##########

  public set(key:string, value:any):Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.nativeStorage.setItem(key, value).then((data:any) => {
          resolve(data);
        },
        (error:any) => {
          reject(error);
        });
      }
      else {
        this.webStorage.asPromisable().set(key, value).then((saved:any) => {
          resolve(true);
        },
        (error:any) => {
          reject(error);
        });
      }
    });
  }

  public get(key:string):Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.nativeStorage.getItem(key).then((data:any) => {
          resolve(data);
        },
        (error:any) => {
          resolve(null);
        });
      }
      else {
        this.webStorage.asPromisable().get(key).then((data:any) => {
          resolve(data);
        },
        (error:any) => {
          resolve(null);
        });
      }
    });
  }

  public has(key:string):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.get(key).then((data:any) => {
        if (data != null) {
          resolve(true);
        }
        else {
          resolve(false);
        }
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public remove(key:string):Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        this.nativeStorage.remove(key).then((removed:any) => {
          resolve(true);
        },
        (error:any) => {
          resolve(false);
        });
      }
      else {
        this.webStorage.asPromisable().remove(key).then((deleted:any) => {
          resolve(true);
        },
        (error:any) => {
          resolve(false);
        });
      }
    });
  }

  public initialize(models:Model[]):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.provider.initialize(models).then((loaded:any) => {
        resolve(true);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  public reset():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.provider.reset().then((loaded:any) => {
        resolve(true);
      },
      (error:any) => {
        reject(false);
      });
    });
  }

  // ########## FIREBASE ##########

  public hasFirebase():Promise<boolean> {
    return this.has("firebase");
  }

  public getFirebase():Promise<string> {
    return new Promise((resolve, reject) => {
      this.get("firebase").then((data:any) => {
        if (data) {
          resolve(data);
        }
        else {
          reject("No Firebase");
        }
      },
      (error:any) => {
        reject("No Firebase");
      });
    });
  }

  public setFirebase(firebase:string):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.set("firebase", firebase).then((saved:any) => {
        this.logger.info(this, "setFirebase", firebase, "Stored");
        resolve(true);
      },
      (error:any) => {
        this.logger.error(this, "setFirebase", firebase, "Failed", error);
        resolve(false);
      });
    });
  }

  public removeFirebase():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.remove("firebase").then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  // ########## USER ##########

  public hasUser():Promise<boolean> {
    return this.has("user");
  }

  public getUser():Promise<User> {
    return new Promise((resolve, reject) => {
      this.get("user").then((data:any) => {
        if (data) {
          let user = new User(JSON.parse(data));
          resolve(user);
        }
        else {
          reject("No User");
        }
      },
      (error:any) => {
        reject("No User");
      });
    });
  }

  public setUser(user:User):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.set("user", JSON.stringify(user)).then((saved:any) => {
        this.logger.info(this, "setUser", user, "Stored");
        resolve(true);
      },
      (error:any) => {
        this.logger.error(this, "setUser", user, "Failed", error);
        resolve(false);
      });
    });
  }

  public removeUser():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.remove("user").then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  // ########## ORGANIZATION ##########

  public hasOrganization():Promise<boolean> {
    return this.has("organization");
  }

  public getOrganization():Promise<Organization> {
    return new Promise((resolve, reject) => {
      this.get("organization").then((data:any) => {
        if (data) {
          let organization = new Organization(JSON.parse(data));
          resolve(organization);
        }
        else {
          reject("No Organization");
        }
      },
      (error:any) => {
        reject("No Organization");
      });
    });
  }

  public setOrganization(organization:Organization):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.set("organization", JSON.stringify(organization)).then((saved:any) => {
        this.logger.info(this, "setOrganization", organization, "Stored");
        resolve(true);
      },
      (error:any) => {
        this.logger.error(this, "setOrganization", organization, "Failed", error);
        resolve(false);
      });
    });
  }

  public removeOrganization():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.remove("organization").then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public saveOrganization(organization:Organization):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.provider.saveModel(organization).then((saved:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public getOrganizations(where:{}=null, order:{}=null, limit:number=null, offset:number=null):Promise<Organization[]> {
    return new Promise((resolve, reject) => {
      this.provider.getModels<Organization>(new Organization(), where, order, limit, offset).then((organizations:Organization[]) => {
        resolve(organizations);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  // public getOrganization(id:number):Promise<Organization> {
  //   return new Promise((resolve, reject) => {
  //     let where = { id: id };
  //     this.provider.getModel<Organization>(new Organization(), where).then((organization:Organization) => {
  //       resolve(organization);
  //     },
  //     (error:any) => {
  //       reject(error);
  //     });
  //   });
  // }

  // public removeOrganization(organization:Organization):Promise<boolean> {
  //   return new Promise((resolve, reject) => {
  //     let where = { id: organization.id };
  //     this.provider.removeModel<Organization>(new Organization(), where).then((removed:any) => {
  //       resolve(true);
  //     },
  //     (error:any) => {
  //       resolve(false);
  //     });
  //   });
  // }

  public removeOrganizations():Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = { };
      this.provider.removeModel<Organization>(new Organization(), where).then((removed:any) => {
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
      this.provider.saveModel(person).then((saved:any) => {
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

  public getPeople(organization:Organization, ids:number[]=null, limit:number=null, offset:number=null, filter:String=null):Promise<Person[]> {
    return new Promise((resolve, reject) => {
      let where = { };
      if (organization) {
        where["organization_id"] = organization.id;
      }
      if (ids) {
        where["id"] = ids;
      }
      if (filter) {
        where["name"] = '%' + filter + '%';
      }
      let order = { name: "ASC" };
      this.provider.getModels<Person>(new Person(), where, order, limit, offset).then((people:Person[]) => {
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
      this.provider.getModel<Person>(new Person(), where).then((person:Person) => {
        if (person) {
          Promise.all([
            this.getContacts(organization, person),
            this.getCheckinsForPerson(organization, person),
            this.getGroupsForPerson(organization, person)]).then((results:any[]) => {
              person.contacts = results[0];
              person.checkins = results[1];
              person.groups = results[2];
              resolve(person);
            },
            (error:any) => {
              reject(error);
            });
        }
        else {
          resolve(person);
        }
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
      this.provider.removeModel<Person>(new Person(), where).then((removed:any) => {
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
      this.provider.removeModel<Person>(new Person(), where).then((removed:any) => {
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
      this.provider.saveModel(contact).then((saved:any) => {
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
      this.provider.getModels<Contact>(new Contact(), where, order, limit, offset).then((contacts:Contact[]) => {
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
      this.provider.getModel<Contact>(new Contact(), where).then((contact:Contact) => {
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
      this.provider.removeModel<Contact>(new Contact(), where).then((removed:any) => {
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
      this.provider.removeModel<Contact>(new Contact(), where).then((removed:any) => {
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
      if (checkins) {
        for (let checkin of checkins) {
          saves.push(this.saveCheckin(organization, checkin));
        }
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
      this.provider.saveModel(checkin).then((saved:any) => {
        let saves = [];
        if (checkin.answers) {
          for (let answer of checkin.answers) {
            saves.push(this.saveAnswer(organization, checkin, answer));
          }
        }
        if (checkin.recipients) {
          for (let recipient of checkin.recipients) {
            saves.push(this.saveRecipient(organization, checkin, recipient));
          }
        }
        if (checkin.replies) {
          for (let reply of checkin.replies) {
            saves.push(this.saveReply(organization, checkin, reply));
          }
        }
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
      this.provider.getModels<Checkin>(new Checkin(), where, order, limit, offset).then((checkins:Checkin[]) => {
        if (checkins && checkins.length > 0) {
          let checkin_ids = checkins.map((checkin:Checkin) => checkin.id);
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
        }
        else {
          resolve([]);
        }
      });
    });
  }

  public getCheckinsForPerson(organization:Organization, person:Person, limit:number=null, offset:number=null):Promise<Checkin[]> {
    return new Promise((resolve, reject) => {
      let order = { created_at: "DESC" };
      this.provider.getModels<Reply>(new Reply(), { organization_id: organization.id, user_id: person.id }, order).then((replies:Reply[]) => {
        let checkin_ids = replies.map((reply) => reply.checkin_id);
        this.provider.getModels<Checkin>(new Checkin(), { organization_id: organization.id, id: checkin_ids }, order, limit, offset).then((checkins:Checkin[]) => {
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

  public getCheckinsWaiting(organization:Organization, user:User, limit:number=null, offset:number=null):Promise<Checkin[]> {
    return new Promise((resolve, reject) => {
      let where = {
        organization_id: organization.id,
        waiting_count: "> 0"
      };
      let order = { created_at: "DESC" };
      this.provider.getModels<Checkin>(new Checkin(), where, order, limit, offset).then((checkins:Checkin[]) => {
        if (checkins && checkins.length) {
          let checkin_ids = checkins.map((checkin:Checkin) => checkin.id);
          Promise.all([
            this.getAnswers(organization, null, checkin_ids),
            this.getReplies(organization, null, checkin_ids),
            this.getRecipients(organization, null, checkin_ids)]).then((results:any[]) => {
              let answers = <Answer[]>results[0];
              let replies = <Reply[]>results[1];
              let recipients = <Recipient[]>results[2];
              let waiting = [];
              for (let checkin of checkins) {
                checkin.answers = answers.filter(answer => answer.checkin_id == checkin.id);
                checkin.replies = replies.filter(reply => reply.checkin_id == checkin.id);
                checkin.recipients = recipients.filter(recipient => recipient.checkin_id == checkin.id);
                if (checkin.canRespond(user)) {
                  waiting.push(checkin);
                }
              }
              resolve(waiting);
          },
          (error:any) => {
            resolve(checkins);
          });
        }
        else {
          resolve([]);
        }
      },
      (error:any) => {
        resolve([]);
      });
    });
  }

  public getCheckin(organization:Organization, id:number):Promise<Checkin> {
    return new Promise((resolve, reject) => {
      let where = { id: id };
      this.provider.getModel<Checkin>(new Checkin(), where).then((checkin:Checkin) => {
        if (checkin) {
          Promise.all([
            this.getAnswers(organization, checkin),
            this.getReplies(organization, checkin),
            this.getRecipients(organization, checkin)]).then((results:any[]) => {
              checkin.answers = <Answer[]>results[0];
              checkin.replies = <Reply[]>results[1];
              checkin.recipients = <Recipient[]>results[2];
              resolve(checkin);
          });
        }
        else {
          resolve(null);
        }
      });
    });
  }

  public removeCheckin(organization:Organization, checkin:Checkin):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = {
        organization_id: organization.id,
        id: checkin.id
      };
      this.provider.removeModel<Checkin>(new Checkin(), where).then((removed:any) => {
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
      this.provider.removeModel<Checkin>(new Checkin(), where).then((removed:any) => {
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
      this.provider.saveModel(answer).then((saved:any) => {
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
      this.provider.getModels<Answer>(new Answer(), where, order, limit, offset).then((answers:Answer[]) => {
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
      this.provider.getModel<Answer>(new Answer(), where).then((answer:Answer) => {
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
      this.provider.removeModel<Answer>(new Answer(), where).then((removed:any) => {
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
      this.provider.removeModel<Answer>(new Answer(), where).then((removed:any) => {
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
      this.provider.saveModel(reply).then((saved:any) => {
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
      this.provider.getModels<Reply>(new Reply(), where, order, limit, offset).then((replies:Reply[]) => {
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
      this.provider.getModel<Reply>(new Reply(), where).then((reply:Reply) => {
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
      this.provider.removeModel<Reply>(new Reply(), where).then((removed:any) => {
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
      this.provider.removeModel<Reply>(new Reply(), where).then((removed:any) => {
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
      this.provider.saveModel(recipient).then((saved:any) => {
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
      this.provider.getModels<Recipient>(new Recipient(), where, order, limit, offset).then((recipients:Recipient[]) => {
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
      this.provider.getModel<Recipient>(new Recipient(), where).then((recipient:Recipient) => {
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
      this.provider.removeModel<Recipient>(new Recipient(), where).then((removed:any) => {
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
      this.provider.removeModel<Recipient>(new Recipient(), where).then((removed:any) => {
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
      this.provider.saveModel(email).then((saved:any) => {
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
      this.provider.getModels<Email>(new Email(), where, order, limit, offset).then((emails:Email[]) => {
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
      this.provider.getModel<Email>(new Email(), where).then((email:Email) => {
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
      this.provider.removeModel<Email>(new Email(), where).then((removed:any) => {
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
      this.provider.removeModel<Email>(new Email(), where).then((removed:any) => {
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
      this.provider.saveModel(notification, false).then((saved:any) => {
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
      this.provider.getModels<Notification>(new Notification(), where, order, limit, offset).then((notifications:Notification[]) => {
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
      this.provider.getModel<Notification>(new Notification(), where).then((notification:Notification) => {
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
      this.provider.removeModel<Notification>(new Notification(), where).then((removed:any) => {
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
      this.provider.removeModel<Notification>(new Notification(), where).then((removed:any) => {
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
      this.provider.saveModel(group).then((saved:any) => {
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
        this.provider.getModels<Group>(new Group(), where, order, limit, offset),
        this.getPeople(organization)]).then((results:any[]) => {
          let groups = <Group[]>results[0];
          let people = <Person[]>results[1];
          for (let group of groups) {
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
        id: id
      };
      this.provider.getModel<Group>(new Group(), where).then((group:Group) => {
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
      this.provider.removeModel<Group>(new Group(), where).then(resolve, reject);
    });
  }

  public removeGroups(organization:Organization=null):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = { };
      if (organization) {
        where['organization_id'] = organization.id;
      }
      this.provider.removeModel<Group>(new Group(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public getGroupsForPerson(organization:Organization, person:Person, limit:number=null, offset:number=null):Promise<Group[]> {
    return new Promise((resolve, reject) => {
      this.getGroups(organization, limit, offset).then((groups:Group[]) => {
        let _groups = [];
        for (let group of groups) {
          if (group.isMember(person)) {
            _groups.push(group);
          }
        }
        resolve(_groups);
      },
      (error:any) => {
        resolve([]);
      });
    });
  }

  public getGroupMembers(organization:Organization, group:Group):Promise<Person[]> {
    return new Promise((resolve, reject) => {
      if (group && group.member_ids) {
        let member_ids = group.member_ids.split(",").map(id => Number(id));
        this.getPeople(organization, member_ids).then((people:Person[]) => {
          group.members = people.sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
          });
          resolve(group.members);
        },
        (error:any) => {
          group.members = [];
          resolve([]);
        });
      }
      else {
        resolve([]);
      }
    });
  }

  // ########## SETTINGS ##########

  public saveSettings(organization:Organization, settings:Settings):Promise<boolean> {
    return new Promise((resolve, reject) => {
      settings.organization_id = organization.id;
      this.provider.saveModel(settings).then((saved:any) => {
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
      this.provider.getModels<Settings>(new Settings(), where, order).then((settings:Settings[]) => {
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
      this.provider.getModel<Settings>(new Settings(), where).then((settings:Settings) => {
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
      this.provider.removeModel<Settings>(new Settings(), where).then((removed:any) => {
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
      this.provider.removeModel<Settings>(new Settings(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  // ########## SUBSCRIPTIONS ##########

  public hasSubscription():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.get("subscription").then((data:any) => {
        if (data) {
          resolve(true);
        }
        else {
          resolve(false);
        }
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public saveSubscription(organization:Organization, subscription:Subscription):Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (subscription) {
        subscription.organization_id = organization.id;
        this.provider.saveModel(subscription).then((saved:any) => {
          resolve(true);
        },
        (error:any) => {
          resolve(false);
        });
      }
      else {
        resolve(false);
      }
    });
  }

  public setSubscription(subscription:Subscription):Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (subscription) {
        this.set("subscription", JSON.stringify(subscription)).then((saved:any) => {
          this.logger.info(this, "setSubscription", subscription, "Stored");
          resolve(true);
        },
        (error:any) => {
          this.logger.error(this, "setSubscription", subscription, "Failed", error);
          resolve(false);
        });
      }
      else {
        this.remove("subscription").then((removed:any) => {
          this.logger.info(this, "setSubscription", "NULL", "Removed");
          resolve(false);
        },
        (error:any) => {
          this.logger.error(this, "setSubscription", "NULL", "Failed", error);
          resolve(false);
        });
      }
    });
  }

  public getSubscriptions(organization:Organization, limit:number=null, offset:number=null):Promise<Subscription[]> {
    return new Promise((resolve, reject) => {
      let where = { organization_id: organization.id };
      let order = { created_at: "ASC" };
      this.provider.getModels<Subscription>(new Subscription(), where, order, limit, offset).then((subscriptions:Subscription[]) => {
        resolve(subscriptions);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  public getSubscription():Promise<Subscription> {
    return new Promise((resolve, reject) => {
      this.get("subscription").then((data:any) => {
        if (data) {
          let subscription = new Subscription(JSON.parse(data));
          resolve(subscription);
        }
        else {
          reject("No Subscription");
        }
      },
      (error:any) => {
        reject("No Subscription");
      });
    });
  }

  public removeSubscription(organization:Organization, subscription:Subscription):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let where = {
        organization_id: organization.id,
        id: subscription.id
      };
      this.provider.removeModel<Subscription>(new Subscription(), where).then((removed:any) => {
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
      this.provider.removeModel<Subscription>(new Subscription(), where).then((removed:any) => {
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
      this.provider.saveModel(country).then((saved:any) => {
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
      this.provider.getModels<Country>(new Country(), where, order, limit, offset).then((countries:Country[]) => {
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
      this.provider.getModel<Country>(new Country(), where).then((country:Country) => {
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
      this.provider.removeModel<Country>(new Country(), where).then((removed:any) => {
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
      this.provider.removeModel<Country>(new Country(), where).then((removed:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  public getVerificationCode():Promise<string> {
    return this.get('verification_code');
  }

  public setVerificationCode(code:string):Promise<any> {
    return this.set('verification_code', code);
  }

}
