import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { HTTP } from '@ionic-native/http';
import { File } from '@ionic-native/file';
import { Device } from '@ionic-native/device';
import { FileTransfer } from '@ionic-native/file-transfer';
import { NativeStorage } from '@ionic-native/native-storage';

import { HttpService } from '../providers/http-service';
import { LoggerService } from '../providers/logger-service';
import { DatabaseService } from '../providers/database-service';

import { Token } from '../models/token';
import { Email } from '../models/email';
import { Person } from '../models/person';
import { Contact } from '../models/contact';
import { Organization } from '../models/organization';
import { Checkin } from '../models/checkin';
import { Reply } from '../models/reply';
import { Answer } from '../models/answer';
import { Group } from '../models/group';
import { Settings } from '../models/settings';
import { Region } from '../models/region';
import { Subscription } from '../models/subscription';
import { Notification } from '../models/notification';

@Injectable()
export class ApiService extends HttpService {

  clientId:string = "1";
  clientSecret:string = "T7913s89oGgJ478J73MRHoO2gcRRLQ";

  scope:string = "user";
  api:string = "https://api.tenfour.org";
  // api:string = "https://api.staging.tenfour.org";

  constructor(
    protected device:Device,
    protected platform:Platform,
    protected http:HTTP,
    protected file:File,
    protected transfer:FileTransfer,
    protected logger:LoggerService,
    protected storage:NativeStorage,
    protected database:DatabaseService) {
    super(http, file, transfer, logger);
  }

  public saveToken(organization:Organization, token:Token) {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "saveToken", token);
      let json = JSON.stringify(token);
      this.storage.setItem(organization.subdomain, json).then(
        (data:any) => {
          resolve(data);
        },
        (error:any) => {
          this.logger.error(this, "saveToken", token, "Error", error);
          reject(error);
        });
    });
  }

  public getToken(organization:Organization):Promise<Token> {
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

  public removeToken(organization:Organization):Promise<boolean> {
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

  public clientLogin(organization:Organization):Promise<Token> {
    return new Promise((resolve, reject) => {
      let url = `${this.api}/oauth/token`;
      let params = {
        grant_type: "client_credentials",
        scope: this.scope,
        client_id: this.clientId,
        client_secret: this.clientSecret
      };
      this.httpPost(url, params).then(
        (data:any) => {
          let token:Token = <Token>data;
          token.issued_at = new Date();
          if (data.expires_in) {
            token.expires_at = new Date();
            token.expires_at.setMinutes(token.expires_at.getMinutes() + data.expires_in/60);
          }
          this.logger.info(this, "clientLogin", token);
          this.saveToken(organization, token).then(saved => {
            resolve(token);
          });
        },
        (error:any) => {
          reject(error);
        })
    });
  }

  public userLogin(organization:Organization, username:string, password:string):Promise<Token> {
    return new Promise((resolve, reject) => {
      let url = `${this.api}/oauth/token`;
      let params = {
        grant_type: "password",
        scope: this.scope,
        username: `${organization.subdomain}:${username}`,
        password: password,
        client_id: this.clientId,
        client_secret: this.clientSecret
      };
      this.httpPost(url, params).then(
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
          this.logger.info(this, "userLogin", token);
          this.saveToken(organization, token).then(saved => {
            resolve(token);
          });
        },
        (error:any) => {
          reject(error);
        })
    });
  }

  public refreshLogin(organization:Organization, refreshToken:string):Promise<Token> {
    return new Promise((resolve, reject) => {
      let url = `${this.api}/oauth/token`;
      let params = {
        grant_type: "refresh_token",
        scope: this.scope,
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret
      };
      this.httpPost(url, params).then(
        (data:any) => {
          let token:Token = <Token>data;
          token.issued_at = new Date();
          if (data.expires_in) {
            token.expires_at = new Date();
            token.expires_at.setMinutes(token.expires_at.getMinutes() + data.expires_in/60);
          }
          this.logger.info(this, "refreshLogin", token);
          this.saveToken(organization, token).then(saved => {
            resolve(token);
          });
        },
        (error:any) => {
          reject(error);
        })
    });
  }

  public registerEmail(email:string):Promise<Email> {
    return new Promise((resolve, reject) => {
      let url = `${this.api}/verification/email`;
      let params = {
        address: email
      };
      this.httpPost(url, params).then(
        (data:any) => {
          let email = new Email(data);
          resolve(email);
        },
        (error:any) => {
          reject(error);
        });
    });
  }

  public verifyEmail(email:string, token:string):Promise<Email> {
    return new Promise((resolve, reject) => {
      let url = `${this.api}/verification/email/`;
      let params = {
        address: email,
        token: token
      };
      this.httpGet(url, params).then(
        (data:any) => {
          let email = new Email(data);
          resolve(email);
        },
        (error:any) => {
          reject(error);
        });
    });
  }

  public getOrganizations(subdomain:string=null, name:string=null):Promise<Organization[]> {
    return new Promise((resolve, reject) => {
      let params = {};
      if (name) {
        params['name'] = name;
      }
      if (subdomain) {
        params['subdomain'] = subdomain;
      }
      let url = `${this.api}/api/v1/organizations`;
      this.httpGet(url, params).then(
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

  public getOrganization(organization:Organization):Promise<Organization> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}`;
        let params = { };
        this.httpGet(url, params, token.access_token).then(
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

  public createOrganization(organization:Organization):Promise<Organization> {
    return new Promise((resolve, reject) => {
      let url = `${this.api}/create_organization`;
      let params = {
        name: organization.name,
        email: organization.email,
        owner: organization.user_name,
        password: organization.password,
        subdomain: organization.subdomain,
        terms_of_service: true,
      };
      this.clientLogin(organization).then((token:Token) => {
        this.httpPost(url, params, token.access_token).then(
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

  public updateOrganization(organization:Organization):Promise<Organization> {
    return new Promise((resolve, reject) => {
      let url = `${this.api}/api/v1/organizations/${organization.id}`;
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
        this.httpPut(url, params, token.access_token).then(
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

  public getPeople(organization:Organization, limit:number=20, offset:number=0):Promise<Person[]> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/people/?limit=${limit}&offset=${offset}`;
        let params = { };
        this.httpGet(url, params, token.access_token).then(
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

  public getPerson(organization:Organization, id:any="me"):Promise<Person> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/people/${id}`;
        let params = { };
        this.httpGet(url, params, token.access_token).then(
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

  public createPerson(organization:Organization, person:Person):Promise<Person> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${person.organization_id}/people`;
        let params = {
          name: person.name,
          description: person.description || "",
          person_type: "user",
          role: person.role || "responder" };
        if (person.profile_picture && person.profile_picture.startsWith("data:image")) {
          params['_input_image'] = person.profile_picture;
        }
        this.httpPost(url, params, token.access_token).then(
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

  public updatePerson(organization:Organization, person:Person):Promise<Person> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${person.organization_id}/people/${person.id}`;
        let params = {
          name: person.name,
          role: person.role,
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
        this.httpPut(url, params, token.access_token).then(
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

  public deletePerson(organization:Organization, person:Person):Promise<any> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${person.organization_id}/people/${person.id}`;
        let params = { };
        this.httpDelete(url, params, token.access_token).then(
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

  public invitePerson(organization:Organization, person:Person):Promise<Person> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${person.organization_id}/people/${person.id}/invite`;
        let params = {
          orgId: person.organization_id,
          personId: person.id
        };
        this.httpPost(url, params, token.access_token).then(
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

  public createContact(organization:Organization, person:Person, contact:Contact):Promise<Contact> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${person.organization_id}/people/${person.id}/contacts`;
        let params = {
          type: contact.type,
          contact: contact.contact || "",
          preferred: contact.preferred || 0,
          organization_id: person.organization_id
        };
        this.httpPost(url, params, token.access_token).then(
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

  public updateContact(organization:Organization, person:Person, contact:Contact):Promise<Contact> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${person.organization_id}/people/${person.id}/contacts/${contact.id}`;
        let params = {
          type: contact.type,
          contact: contact.contact,
          preferred: contact.preferred || 0,
          organization_id: person.organization_id
        };
        this.httpPut(url, params, token.access_token).then(
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

  public getCheckins(organization:Organization, limit:number=10, offset:number=0):Promise<Checkin[]> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/checkins/?limit=${limit}&offset=${offset}`;
        let params = { };
        this.httpGet(url, params, token.access_token).then(
          (data:any) => {
            let checkins = [];
            if (data && data.checkins) {
              for (let _checkin of data.checkins) {
                let checkin = new Checkin(_checkin);
                checkins.push(checkin);
              }
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
    });
  }

  public getCheckin(organization:Organization, id:number):Promise<Checkin> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/checkins/${id}`;
        let params = { };
        this.httpGet(url, params, token.access_token).then(
          (data:any) => {
            if (data && data.checkin) {
              let checkin = new Checkin(data.checkin);
              resolve(checkin);
            }
            else {
              reject("Checkin Not Found");
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

  public postCheckin(organization:Organization, checkin:Checkin):Promise<Checkin> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/checkins`;
        let params = {
          creditsRequired: 0,
          organization_id: organization.id,
          message: checkin.message,
          answers: checkin.answers,
          recipients: checkin.recipientIds(),
          send_via: [checkin.send_via]
        };
        if (checkin.self_test_check_in) {
          params['self_test_check_in'] = 1;
        }
        this.httpPost(url, params, token.access_token).then(
          (data:any) => {
            if (data && data.checkin) {
              let checkin = new Checkin(data.checkin);
              resolve(checkin);
            }
            else {
              reject("Checkin Not Created");
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

  public postReply(organization:Organization, checkin:Checkin, reply:Reply):Promise<Reply> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/checkins/${checkin.id}/replies`;
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
          if (reply.latitude != null && reply.longitude != null) {
            params["location_geo"] = {
              location: {
                lat: reply.latitude,
                lng: reply.longitude
              }
            };
          }
        }
        this.httpPost(url, params, token.access_token).then(
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

  public putReply(organization:Organization, checkin:Checkin, reply:Reply):Promise<Reply> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/checkins/${checkin.id}/replies/${reply.id}`;
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
          if (reply.latitude != null && reply.longitude != null) {
            params["location_geo"] = {
              location: {
                lat: reply.latitude,
                lng: reply.longitude
              }
            };
          }
          else {
            params["location_geo"] = "";
          }
        }
        this.httpPut(url, params, token.access_token).then(
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

  public getNotifications(organization:Organization):Promise<Notification[]> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/people/me`;
        let params = { };
        this.httpGet(url, params, token.access_token).then(
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

  public getAnswers(organization:Organization, id:number):Promise<Answer[]> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/checkins/${id}`;
        let params = { };
        this.httpGet(url, params, token.access_token).then(
          (data:any) => {
            if (data && data.checkin && data.checkin.answers) {
              let answers = [];
              for (let _answer of data.checkin.answers) {
                let answer = new Answer(_answer);
                answer.replies = data.checkin.replies.filter(reply => reply.answer == answer.answer).length;
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

  public getGroups(organization:Organization, limit:number=20, offset:number=0):Promise<Group[]> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/groups/?limit=${limit}&offset=${offset}`;
        let params = { };
        this.httpGet(url, params, token.access_token).then(
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

  public getGroup(organization:Organization, id:number):Promise<Group> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/groups/${id}`;
        let params = { };
        this.httpGet(url, params, token.access_token).then(
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

  public createGroup(organization:Organization, group:Group):Promise<Group> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/groups`;
        let params = {
          name: group.name,
          description: group.description || "",
          members: group.memberIds() };
        this.httpPost(url, params, token.access_token).then(
          (data:any) => {
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

  public updateGroup(organization:Organization, group:Group):Promise<Group> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/groups/${group.id}`;
        let params = {
          name: group.name,
          description: group.description || "",
          members: group.memberIds()
        };
        this.httpPut(url, params, token.access_token).then(
          (data:any) => {
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

  public deleteGroup(organization:Organization, group:Group):Promise<Group> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/groups/${group.id}`;
        let params = { };
        this.httpDelete(url, params, token.access_token).then(
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

  public getSubscriptions(organization:Organization):Promise<Subscription[]> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/subscriptions`;
        let params = { };
        this.httpGet(url, params, token.access_token).then(
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

  public getRegions(organization:Organization):Promise<Region[]> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/regions`;
        let params = { };
        this.httpGet(url, params, token.access_token).then(
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
