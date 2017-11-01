import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Http } from '@angular/http';

import { Transfer} from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { NativeStorage } from '@ionic-native/native-storage';
import { Device } from '@ionic-native/device';

import { HttpService } from '../providers/http-service';
import { LoggerService } from '../providers/logger-service';
import { DatabaseService } from '../providers/database-service';

import { Token } from '../models/token';
import { Email } from '../models/email';
import { Person } from '../models/person';
import { Contact } from '../models/contact';
import { Organization } from '../models/organization';
import { Rollcall } from '../models/rollcall';
import { Reply } from '../models/reply';
import { Answer } from '../models/answer';
import { Group } from '../models/group';
import { Settings } from '../models/settings';
import { Region } from '../models/region';
import { Subscription } from '../models/subscription';
import { Notification } from '../models/notification';

@Injectable()
export class ApiService extends HttpService {

  clientId:string = "webapp";
  clientSecret:string = "T7913s89oGgJ478J73MRHoO2gcRRLQ";

  scope:string = "user";
  api:string = "https://api.staging.rollcall.io";

  constructor(
    protected device:Device,
    protected platform:Platform,
    protected http:Http,
    protected file:File,
    protected transfer:Transfer,
    protected logger:LoggerService,
    protected storage:NativeStorage,
    protected database:DatabaseService) {
    super(http, file, transfer, logger);
  }

  saveToken(organization:Organization, token:Token) {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "saveToken", token);
      let json = JSON.stringify(token);
      this.storage.setItem(organization.subdomain, json).then(
        (data:any) => {
          resolve(data);
        },
        (error:any) => {
          reject(error);
        });
    });
  }

  getToken(organization:Organization):Promise<Token> {
    return new Promise((resolve, reject) => {
      this.storage.getItem(organization.subdomain).then(
        (data:any) => {
          this.logger.info(this, "getToken", data);
          if (data) {
            let json = JSON.parse(data);
            let token:Token = <Token>json;
            let now = new Date();
            if (now > token.expires_at) {
              this.logger.info(this, "getToken", "Valid", token);
              resolve(token);
            }
            else {
              this.logger.info(this, "getToken", "Expired", token);
              this.userLogin(organization, token.username, token.password).then(
                (token:Token) => {
                  resolve(token);
                },
                (error:any) => {
                  reject(error);
              });
            }
          }
          else {
            reject("No Token");
          }
        },
        (error:any) => {
          this.logger.error(this, "getToken", error);
          reject(error);
        });
    });
  }

  removeToken(organization:Organization):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.storage.remove(organization.subdomain).then(
        (removed:any) => {
          resolve(true);
        },
        (error:any) => {
          reject(error);
        });
    });
  }

  clientLogin(organization:Organization):Promise<Token> {
    return new Promise((resolve, reject) => {
      let url = this.api + "/oauth/access_token";
      let params = {
        grant_type: "client_credentials",
        scope: this.scope,
        client_id: this.clientId,
        client_secret: this.clientSecret };
      this.httpPost(url, null, params).then(
        (data:any) => {
          let token:Token = <Token>data;
          token.issued_at = new Date();
          if (data.expires_in) {
            token.expires_at = new Date();
            token.expires_at.setMinutes(token.expires_at.getMinutes() + data.expires_in/60);
          }
          this.saveToken(organization, token).then(saved => {
            resolve(token);
          });
        },
        (error:any) => {
          reject(error);
        })
    });
  }

  userLogin(organization:Organization, username:string, password:string):Promise<Token> {
    return new Promise((resolve, reject) => {
      let url = this.api + "/oauth/access_token";
      let params = {
        grant_type: "password",
        scope: this.scope,
        username: username,
        password: password,
        subdomain: organization.subdomain,
        client_id: this.clientId,
        client_secret: this.clientSecret };
      this.httpPost(url, null, params).then(
        (data:any) => {
          let token:Token = <Token>data;
          token.username = username;
          token.password = password;
          token.organization = organization.name;
          token.issued_at = new Date();
          if (data.expires_in) {
            token.expires_at = new Date();
            token.expires_at.setMinutes(token.expires_at.getMinutes() + data.expires_in/60);
          }
          this.saveToken(organization, token).then(saved => {
            resolve(token);
          });
        },
        (error:any) => {
          reject(error);
        })
    });
  }

  refreshLogin(organization:Organization, refreshToken:string):Promise<Token> {
    return new Promise((resolve, reject) => {
      let url = this.api + "/oauth/access_token";
      let params = {
        grant_type: "refresh_token",
        scope: this.scope,
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret };
      this.httpPost(url, null, params).then(
        (data:any) => {
          let token:Token = <Token>data;
          token.issued_at = new Date();
          if (data.expires_in) {
            token.expires_at = new Date();
            token.expires_at.setMinutes(token.expires_at.getMinutes() + data.expires_in/60);
          }
          this.saveToken(organization, token).then(saved => {
            resolve(token);
          });
        },
        (error:any) => {
          reject(error);
        })
    });
  }

  checkEmail(email:string):Promise<Email> {
    return new Promise((resolve, reject) => {
      let url = this.api + "/verification/email";
      let params = {
        address: email };
      this.httpGet(url, null, params).then(
        (data:any) => {
          let email = new Email(data);
          resolve(email);
        },
        (error:any) => {
          reject(error);
        });
    });
  }

  registerEmail(email:string):Promise<Email> {
    return new Promise((resolve, reject) => {
      let url = this.api + "/verification/email";
      let params = {
        address: email };
      this.httpPost(url, null, params).then(
        (data:any) => {
          let email = new Email(data);
          resolve(email);
        },
        (error:any) => {
          reject(error);
        });
    });
  }

  getOrganizations(subdomain:string=null, name:string=null):Promise<Organization[]> {
    return new Promise((resolve, reject) => {
      let params = { };
      if (name) {
        params['name'] = name;
      }
      if (subdomain) {
        params['subdomain'] = subdomain;
      }
      let url = this.api + "/api/v1/organizations";
      this.httpGet(url, null, params).then(
        (data:any) => {
          if (data.organizations && data.organizations.length > 0) {
            let organizations = [];
            for (let attributes of data.organizations) {
              let organization = new Organization(attributes);
              organizations.push(organization);
            }
            resolve(organizations);
          }
          else {
            resolve([]);
          }
        },
        (error:any) => {
          reject(error);
        });
    });
  }

  getOrganization(organization:Organization):Promise<Organization> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let params = { };
        let url = this.api + `/api/v1/organizations/${organization.id}`;
        this.httpGet(url, token.access_token, params).then(
          (data:any) => {
            if (data && data.organization) {
              let organization = new Organization(data.organization);
              resolve(organization);
            }
            else {
              reject("Organization Not Found");
            }
          },
          (error:any) => {
            reject(error);
          });
      });
    });
  }

  createOrganization(organization:Organization):Promise<Organization> {
    return new Promise((resolve, reject) => {
      let url = this.api + "/api/v1/organizations";
      let params = {
        name: organization.name,
        email: organization.email,
        owner: organization.user_name,
        password: organization.password,
        subdomain: organization.subdomain };
      this.clientLogin(organization).then((token:Token) => {
        this.httpPost(url, token.access_token, params).then(
          (data:any) => {
            if (data && data.organization) {
              let _organization:Organization = new Organization(data.organization);
              _organization.user_name = organization.user_name;
              _organization.email = organization.email;
              _organization.password = organization.password;
              resolve(_organization);
            }
            else {
              reject("Organization Not Created");
            }
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

  updateOrganization(organization:Organization):Promise<Organization> {
    return new Promise((resolve, reject) => {
      let url = this.api + `/api/v1/organizations/${organization.id}`;
      let settings = {
        channels: {
          app: { enabled: organization.app_enabled == true },
			    email: { enabled: organization.email_enabled == true },
			    sms: { enabled: organization.sms_enabled == true },
			    slack: { enabled: organization.slack_enabled == true }
		    },
		    location: {
          name: organization.location
		    },
		  };
      if (organization.types) {
        settings['organization_types'] = organization.types.split(",");
      }
      if (organization.size) {
        settings['organization_size'] = {size: organization.size};
      }
      if (organization.countries && organization.countries.length > 0) {
        let regions = [];
        for (let country of organization.countries) {
          if (country.selected == true) {
            regions.push({
              code: country.code,
              country_code: country.country_code});
          }
        }
        settings['channels']['sms']['regions'] = regions;
      }
      let params = {
        id: organization.id,
        name: organization.name,
        subdomain: organization.subdomain,
        settings: settings };
      this.getToken(organization).then((token:Token) => {
        this.httpPut(url, token.access_token, params).then(
          (data:any) => {
            if (data && data.organization) {
              let _organization:Organization = new Organization(data.organization);
              _organization.email = organization.email;
              _organization.password = organization.password;
              resolve(_organization);
            }
            else {
              reject("Organization Not Updated");
            }
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

  getPeople(organization:Organization):Promise<Person[]> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = this.api + `/api/v1/organizations/${organization.id}/people/`;
        this.httpGet(url, token.access_token).then(
          (data:any) => {
            let people = [];
            if (data && data.people) {
              for (let _person of data.people) {
                let person = new Person(_person);
                person.me = person.hasEmail(token.username);
                people.push(person);
              }
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

  getPerson(organization:Organization, id:any="me"):Promise<Person> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = this.api + `/api/v1/organizations/${organization.id}/people/${id}`;
        this.httpGet(url, token.access_token).then(
          (data:any) => {
            if (data && data.person) {
              let person = new Person(data.person);
              person.me = person.hasEmail(token.username);
              resolve(person);
            }
            else {
              reject("Person Not Found");
            }
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

  createPerson(organization:Organization, person:Person):Promise<Person> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = this.api + `/api/v1/organizations/${person.organization_id}/people`;
        let params = {
          name: person.name,
          description: person.description || "",
          person_type: "user",
          role: "member" };
        if (person.profile_picture && person.profile_picture.startsWith("data:image")) {
          params['_input_image'] = person.profile_picture;
        }
        this.httpPost(url, token.access_token, params).then(
          (data:any) => {
            if (data && data.person) {
              resolve(new Person(data.person));
            }
            else {
              reject("Person Not Created");
            }
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

  updatePerson(organization:Organization, person:Person):Promise<Person> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = this.api + `/api/v1/organizations/${person.organization_id}/people/${person.id}`;
        let params = {
          name: person.name,
          description: person.description || ""};
        if (person.profile_picture && person.profile_picture.startsWith("data:image")) {
          params['_input_image'] = person.profile_picture;
        }
        if (person.config_self_test_sent) {
          params['config_self_test_sent'] = true;
        }
        if (person.config_profile_reviewed) {
          params['config_profile_reviewed'] = true;
        }
        this.httpPut(url, token.access_token, params).then(
          (data:any) => {
            if (data && data.person) {
              resolve(new Person(data.person));
            }
            else {
              reject("Person Not Updated");
            }
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

  deletePerson(organization:Organization, person:Person):Promise<any> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = this.api + `/api/v1/organizations/${person.organization_id}/people/${person.id}`;
        this.httpDelete(url, token.access_token).then(
          (data:any) => {
            resolve(data);
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

  invitePerson(organization:Organization, person:Person):Promise<Person> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = this.api + `/api/v1/organizations/${person.organization_id}/people/${person.id}/invite`;
        let params = {
          orgId: person.organization_id,
          personId: person.id };
        this.httpPost(url, token.access_token, params).then(
          (data:any) => {
            if (data && data.person) {
              let person = new Person(data.person);
              resolve(person);
            }
            else {
              reject("Person Not Invited");
            }
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

  createContact(organization:Organization, person:Person, contact:Contact):Promise<Contact> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = this.api + `/api/v1/organizations/${person.organization_id}/people/${person.id}/contacts`;
        let params = {
          type: contact.type,
          contact: contact.contact || "",
          preferred: contact.preferred || 0,
          organization_id: person.organization_id };
        this.httpPost(url, token.access_token, params).then(
          (data:any) => {
            if (data && data.contact) {
              resolve(new Contact(data.contact));
            }
            else {
              reject("Contact Not Created");
            }
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

  updateContact(organization:Organization, person:Person, contact:Contact):Promise<Contact> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = this.api + `/api/v1/organizations/${person.organization_id}/people/${person.id}/contacts/${contact.id}`;
        let params = {
          type: contact.type,
          contact: contact.contact,
          preferred: contact.preferred || 0,
          organization_id: person.organization_id };
        this.httpPut(url, token.access_token, params).then(
          (data:any) => {
            if (data && data.contact) {
              resolve(new Contact(data.contact));
            }
            else {
              reject("Contact Not Updated");
            }
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

  getRollcalls(organization:Organization, limit:number=10, offset:number=0):Promise<Rollcall[]> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = this.api + `/api/v1/rollcalls/?organization=${organization.id}&limit=${limit}&offset=${offset}`;
        this.httpGet(url, token.access_token).then(
          (data:any) => {
            let rollcalls = [];
            if (data && data.rollcalls) {
              for (let _rollcall of data.rollcalls) {
                let rollcall = new Rollcall(_rollcall);
                rollcalls.push(rollcall);
              }
            }
            resolve(rollcalls);
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

  getRollcall(organization:Organization, id:number):Promise<Rollcall> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = this.api + `/api/v1/rollcalls/${id}`;
        this.httpGet(url, token.access_token).then(
          (data:any) => {
            if (data && data.rollcall) {
              let rollcall = new Rollcall(data.rollcall);
              resolve(rollcall);
            }
            else {
              reject("Rollcall Not Found");
            }
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

  postRollcall(organization:Organization, rollcall:Rollcall):Promise<Rollcall> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = this.api + `/api/v1/rollcalls`;
        let params = {
          creditsRequired: 0,
          organization_id: organization.id,
          message: rollcall.message,
          answers: rollcall.answers,
          groups: rollcall.groupIds(),
          recipients: rollcall.recipientIds(),
          send_via: [rollcall.send_via]
        };
        if (rollcall.self_test_roll_call) {
          params['self_test_roll_call'] = 1;
        }
        this.httpPost(url, token.access_token, params).then(
          (data:any) => {
            if (data && data.rollcall) {
              let rollcall = new Rollcall(data.rollcall);
              resolve(rollcall);
            }
            else {
              reject("Rollcall Not Created");
            }
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

  postReply(organization:Organization, rollcall:Rollcall, reply:Reply):Promise<Reply> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = this.api + `/api/v1/rollcalls/${rollcall.id}/replies`;
        let params = { };
        if (reply) {
          if (reply.answer) {
            params["answer"] = reply.answer;
          }
          if (reply.message) {
            params["message"] = reply.message;
          }
          if (reply.location_text) {
            params["location_text"] = reply.location_text;
          }
        }
        this.httpPost(url, token.access_token, params).then(
          (data:any) => {
            if (data && data.reply) {
              let reply = new Reply(data.reply);
              resolve(reply);
            }
            else {
              reject("Reply Not Sent");
            }
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

  putReply(organization:Organization, rollcall:Rollcall, reply:Reply):Promise<Reply> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = this.api + `/api/v1/rollcalls/${rollcall.id}/replies/${reply.id}`;
        let params = { };
        if (reply) {
          if (reply.answer) {
            params["answer"] = reply.answer;
          }
          if (reply.message) {
            params["message"] = reply.message;
          }
          else {
            params["message"] = "";
          }
          if (reply.location_text) {
            params["location_text"] = reply.location_text;
          }
          else {
            params["location_text"] = "";
          }
        }
        this.httpPut(url, token.access_token, params).then(
          (data:any) => {
            if (data && data.reply) {
              let reply = new Reply(data.reply);
              resolve(reply);
            }
            else {
              reject("Reply Not Sent");
            }
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

  getNotifications(organization:Organization):Promise<Notification[]> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = this.api + `/api/v1/organizations/${organization.id}/people/me`;
        this.httpGet(url, token.access_token).then(
          (data:any) => {
            if (data && data.person && data.person.notifications) {
              let notifications = [];
              for (let _notification of data.person.notifications) {
                let notification = new Notification(_notification);
                notifications.push(notification);
              }
              resolve(notifications);
            }
            else {
              reject("Notifications Not Found");
            }
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

  getAnswers(organization:Organization, id:number):Promise<Answer[]> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = this.api + `/api/v1/rollcalls/${id}`;
        this.httpGet(url, token.access_token).then(
          (data:any) => {
            if (data && data.rollcall && data.rollcall.answers) {
              let answers = [];
              for (let _answer of data.rollcall.answers) {
                let answer = new Answer(_answer);
                answer.replies = data.rollcall.replies.filter(reply => reply.answer == answer.answer).length;
                answers.push(answer);
              }
              resolve(answers);
            }
            else {
              reject("Answers Not Found");
            }
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

  getGroups(organization:Organization):Promise<Group[]> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = this.api + `/api/v1/organizations/${organization.id}/groups`;
        this.httpGet(url, token.access_token).then(
          (data:any) => {
            if (data && data.groups) {
              let groups = [];
              for (let _group of data.groups) {
                let group = new Group(_group);
                groups.push(group);
              }
              resolve(groups);
            }
            else {
              reject("Groups Not Found");
            }
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

  getGroup(organization:Organization, id:number):Promise<Group> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = this.api + `/api/v1/organizations/${organization.id}/groups/${id}`;
        this.httpGet(url, token.access_token).then(
          (data:any) => {
            if (data && data.group) {
              let group = new Group(data.group);
              resolve(group);
            }
            else {
              reject("Group Not Found");
            }
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

  createGroup(organization:Organization, group:Group):Promise<Group> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = this.api + `/api/v1/organizations/${organization.id}/groups`;
        let params = {
          name: group.name,
          description: group.description || "",
          members: group.memberIds() };
        this.httpPost(url, token.access_token, params).then(
          (data:any) => {
            this.logger.info(this, "createGroup", data);
            if (data && data.group) {
              resolve(new Group(data.group));
            }
            else {
              reject("Group Not Created");
            }
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

  updateGroup(organization:Organization, group:Group):Promise<Group> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = this.api + `/api/v1/organizations/${organization.id}/groups/${group.id}`;
        let params = {
          name: group.name,
          description: group.description || "",
          members: group.memberIds()
        };
        this.httpPut(url, token.access_token, params).then(
          (data:any) => {
            this.logger.info(this, "updateGroup", data);
            if (data && data.group) {
              resolve(new Group(data.group));
            }
            else {
              reject("Group Not Updated");
            }
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

  getSubscriptions(organization:Organization):Promise<Subscription[]> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = this.api + `/api/v1/organizations/${organization.id}/subscriptions`;
        this.httpGet(url, token.access_token).then(
          (data:any) => {
            if (data && data.subscriptions) {
              let subscriptions = [];
              for (let _subscription of data.subscriptions) {
                let subscription = new Subscription(_subscription);
                subscriptions.push(subscription);
              }
              resolve(subscriptions);
            }
            else {
              reject("Subscriptions Not Found");
            }
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

  getRegions(organization:Organization):Promise<Region[]> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = this.api + `/api/v1/organizations/${organization.id}/regions`;
        this.httpGet(url, token.access_token).then(
          (data:any) => {
            if (data && data.regions) {
              let regions = [];
              for (let _region of data.regions) {
                let region = <Region>_region;
                regions.push(region);
              }
              resolve(regions);
            }
            else {
              reject("Regions Not Found");
            }
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

}
