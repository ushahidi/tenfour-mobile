import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Http } from '@angular/http';

import { HTTP } from '@ionic-native/http';
import { File } from '@ionic-native/file';
import { Device } from '@ionic-native/device';
import { FileTransfer } from '@ionic-native/file-transfer';

import { Token } from '../../models/token';
import { Email } from '../../models/email';
import { User } from '../../models/user';
import { Person } from '../../models/person';
import { Contact } from '../../models/contact';
import { Organization } from '../../models/organization';
import { Checkin } from '../../models/checkin';
import { Template } from '../../models/template';
import { Reply } from '../../models/reply';
import { Answer } from '../../models/answer';
import { Group } from '../../models/group';
import { Region } from '../../models/region';
import { Subscription } from '../../models/subscription';
import { Notification } from '../../models/notification';

import { HttpProvider } from '../../providers/http/http';
import { LoggerProvider } from '../../providers/logger/logger';
import { StorageProvider } from '../../providers/storage/storage';
import { EnvironmentProvider } from '../../providers/environment/environment';

@Injectable()
export class ApiProvider extends HttpProvider {

  clientId:string = null;
  clientSecret:string = null;
  api:string = null;
  scope:string = "user";

  constructor(
    protected device:Device,
    protected platform:Platform,
    protected http:Http,
    protected httpNative:HTTP,
    protected file:File,
    protected transfer:FileTransfer,
    protected logger:LoggerProvider,
    protected storage:StorageProvider,
    protected environment:EnvironmentProvider) {
    super(platform, http, httpNative, file, transfer, logger);
    this.api = this.environment.getApiEndpoint();
    this.clientId = this.environment.getClientId();
    this.clientSecret = this.environment.getClientSecret();
  }

  public saveToken(organization:Organization, token:Token):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "saveToken", token);
      let json = JSON.stringify(token);
      this.storage.set(organization.subdomain, json).then((data:any) => {
        resolve(true);
      },
      (error:any) => {
        this.logger.error(this, "saveToken", token, "Error", error);
        reject(error);
      });
    });
  }

  public getToken(organization:Organization):Promise<Token> {
    return new Promise((resolve, reject) => {
      this.storage.get(organization.subdomain).then((data:any) => {
        this.logger.info(this, "getToken", data);
        if (data) {
          let json = JSON.parse(data);
          let token:Token = <Token>json;
          let now = new Date();
          if (now < new Date(token.expires_at)) {
            this.logger.info(this, "getToken", "Valid", token);
            resolve(token);
          }
          else {
            this.logger.info(this, "getToken", "Expired", token);
            this.refreshLogin(organization, token.refresh_token).then((token:Token) => {
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
      if (organization) {
        this.storage.remove(organization.subdomain).then((removed:any) => {
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

  public clientLogin(organization:Organization):Promise<Token> {
    return new Promise((resolve, reject) => {
      let url = `${this.api}/oauth/token`;
      let params = {
        grant_type: "client_credentials",
        scope: this.scope,
        client_id: this.clientId,
        client_secret: this.clientSecret
      };
      this.httpPost(url, params).then((data:any) => {
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
      });
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
      this.httpPost(url, params).then((data:any) => {
        let token:Token = <Token>data;
        token.username = username;
        token.organization = organization.name;
        token.issued_at = new Date();
        if (data.expires_in) {
          token.expires_at = new Date();
          token.expires_at.setMinutes(token.expires_at.getMinutes() + data.expires_in/60);
        }
        this.logger.info(this, "userLogin", token);
        this.saveToken(organization, token).then(saved => {
          resolve(token);
        },
        (error:any) => {
          resolve(token);
        });
      },
      (error:any) => {
        reject(error);
      });
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
      this.httpPost(url, params).then((data:any) => {
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
      });
    });
  }

  public registerEmail(email:string):Promise<Email> {
    return new Promise((resolve, reject) => {
      let url = `${this.api}/verification/email`;
      let params = {
        address: email
      };
      this.httpPost(url, params).then((data:any) => {
        let email = new Email(data);
        resolve(email);
      },
      (error:any) => {
        if (error === '409 Conflict' || error === 'Conflict') {
          return reject(`A verification email has already been sent to ${email}`);
        }
        reject(`There was a problem registering email ${email}.`);
      });
    });
  }

  public verifyEmail(email:string, code:string):Promise<Email> {
    return new Promise((resolve, reject) => {
      email = encodeURIComponent(email);
      let url = `${this.api}/verification/email/?address=${email}&code=${code}`;
      let params = {};
      this.httpGet(url, params).then((data:any) => {
        let email = new Email(data);
        resolve(email);
      },
      (error:any) => {
        reject(`There was a problem verifying email ${email}.`);
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
      this.httpGet(url, params).then((data:any) => {
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
        this.httpGet(url, params, token.access_token).then((data:any) => {
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

  public createOrganization(organization:Organization, password:string, verificationCode:string):Promise<Organization> {
    return new Promise((resolve, reject) => {
      let url = `${this.api}/organization/create`;
      let params = {
        name: organization.name,
        email: organization.email,
        owner: organization.user_name,
        password: password,
        subdomain: organization.subdomain,
        terms_of_service: true,
        verification_code: verificationCode
      };
      this.clientLogin(organization).then((token:Token) => {
        this.httpPost(url, params, token.access_token).then((data:any) => {
          if (data && data.organization) {
            let _organization:Organization = new Organization(data.organization);
            _organization.user_name = organization.user_name;
            _organization.email = organization.email;
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
          app: {
            enabled: organization.app_enabled == true
          },
			    email: {
            enabled: organization.email_enabled == true
          },
			    sms: {
            enabled: organization.sms_enabled == true
          },
			    voice: {
            enabled: organization.voice_enabled == true
          },
			    slack: {
            enabled: organization.slack_enabled == true
          }
		    },
		    location: {
          name: organization.location
		    },
        plan_and_credits: {
          monthlyCreditsExtra: organization.credits_extra
        }
		  };
      if (organization.types) {
        settings['organization_types'] = organization.types.split(",");
      }
      if (organization.size) {
        settings['organization_size'] = {size: organization.size};
      }
      if (organization.slack_webhook && organization.slack_webhook.length > 0) {
        settings['channels']['slack']['webhook_url'] = organization.slack_webhook;
      }
      if (organization.ldap_settings && organization.ldap_settings.length) {
        settings['ldap'] = JSON.parse(organization.ldap_settings);
      }
      let params = {
        id: organization.id,
        name: organization.name,
        subdomain: organization.subdomain,
        settings: settings
      };
      if (organization.profile_picture && organization.profile_picture.startsWith("data:image")) {
        params['_input_image'] = organization.profile_picture;
      }
      this.getToken(organization).then((token:Token) => {
        this.httpPut(url, params, token.access_token).then((data:any) => {
          if (data && data.organization) {
            let _organization:Organization = new Organization(data.organization);
            _organization.email = organization.email;
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

  public getPeople(organization:Organization, limit:number=null, offset:number=null, filter:String=null):Promise<Person[]> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/people`;
        let params = { };
        if (limit != null) {
          params['limit'] = limit;
        }
        if (offset != null) {
          params['offset'] = offset;
        }
        if (filter != null) {
          params['filter'] = filter;
        }
        this.httpGet(url, params, token.access_token).then((data:any) => {
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
        let params = {
          history_offset: 0,
          history_limit: 10
        };
        this.httpGet(url, params, token.access_token).then((data:any) => {
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
          role: person.role || "responder",
          groups: person.groupIds()
        };
        if (person.profile_picture && person.profile_picture.startsWith("data:image")) {
          params['_input_image'] = person.profile_picture;
        }
        this.httpPost(url, params, token.access_token).then((data:any) => {
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
          description: person.description || "",
          groups: person.groupIds()
        };
        if (person.config_self_test_sent) {
          params['config_self_test_sent'] = true;
        }
        if (person.config_profile_reviewed) {
          params['config_profile_reviewed'] = true;
        }
        if (person.config_people_invited) {
          params['config_people_invited'] = true;
        }
        if (person.profile_picture && person.profile_picture.startsWith("data:image")) {
          params['_input_image'] = person.profile_picture;
        }
        this.httpPut(url, params, token.access_token).then((data:any) => {
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
        this.httpDelete(url, params, token.access_token).then((data:any) => {
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
        this.httpPost(url, params, token.access_token).then((data:any) => {
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

  public acceptInvite(organization:Organization, person:Person, password:string, token:string):Promise<Person> {
    return new Promise((resolve, reject) => {
      let url = `${this.api}/invite/${organization.id}/accept/${person.id}`;
      let params = {
        password: password,
        invite_token: token,
        terms_of_service: true
      };
      this.httpPost(url, params, null).then((data:any) => {
        this.logger.info(this, "acceptInvite", data);
        if (data && data.person) {
          let person = new Person(data.person);
          resolve(person);
        }
        else {
          reject("Invitation Not Accepted");
        }
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
        this.httpPost(url, params, token.access_token).then((data:any) => {
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
          blocked: contact.blocked ? 1 : 0,
          organization_id: person.organization_id
        };
        this.httpPut(url, params, token.access_token).then((data:any) => {
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

  public getTemplates(organization:Organization):Promise<Template[]> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/checkins/?template=true`;
        let params = { };
        this.httpGet(url, params, token.access_token).then((data:any) => {
          let templates = [];
          if (data && data.checkins) {
            for (let _checkin of data.checkins) {
              let template = new Template(_checkin);
              templates.push(template);
            }
          }
          resolve(templates);
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
        this.httpGet(url, params, token.access_token).then((data:any) => {
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

  public getCheckinsWaiting(organization:Organization, user:User, limit:number=10, offset:number=0):Promise<Checkin[]> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/checkins/?limit=${limit}&offset=${offset}`;
        let params = { };
        this.httpGet(url, params, token.access_token).then((data:any) => {
          let checkins = [];
          if (data && data.checkins) {
            for (let _checkin of data.checkins) {
              let checkin = new Checkin(_checkin);
              if (checkin.canRespond(user)) {
                checkins.push(checkin);
              }
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

  public getCheckinsScheduled(organization:Organization, limit:number=10, offset:number=0):Promise<Checkin[]> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/checkins/scheduled/?limit=${limit}&offset=${offset}`;
        let params = { };
        this.httpGet(url, params, token.access_token).then((data:any) => {
          let checkins = [];
          if (data && data.scheduled_checkins) {
            for (let _checkin of data.scheduled_checkins) {
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

  public deleteCheckinScheduled(organization:Organization, checkin:Checkin):Promise<Checkin> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/checkins/scheduled/${checkin.schedule.id}`;
        let params = { };
        this.httpDelete(url, params, token.access_token).then((data:any) => {
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

  public getCheckinsForPerson(organization:Organization, person:Person, limit:number=10, offset:number=0):Promise<Checkin[]> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/people/${person.id}`;
        let params = {
          history_offset: offset,
          history_limit: limit
        };
        this.httpGet(url, params, token.access_token).then((data:any) => {
          this.logger.info(this, "getCheckinsForPerson", data);
          let checkins = [];
          if (data && data.person && data.person.checkins) {
            this.logger.info(this, "getCheckinsForPerson", "Checkins", data.person.checkins);
            for (let _checkin of data.person.checkins) {
              let checkin = new Checkin(_checkin);
              checkin.user_id = person.id;
              checkin.user_name = person.name;
              checkin.user_initials = person.initials;
              checkin.user_picture = person.profile_picture;
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
        this.httpGet(url, params, token.access_token).then((data:any) => {
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

  public getCheckinForToken(id:number, token:string):Promise<Checkin> {
    return new Promise((resolve, reject) => {
      let url = `${this.api}/checkins/${id}`;
      let params = {
        token: token
      };
      this.httpGet(url, params).then((data:any) => {
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
    });
  }

  private getCheckInParams(organization:Organization, checkin:Checkin) {
    let params = {
      organization_id: organization.id,
      message: checkin.message,
      answers: checkin.answers,
      recipients: checkin.recipientIds().map((id) => { return {id: id} }),
      send_via: checkin.sendVia(),
      everyone: !!checkin.everyone,
      template: !!checkin.template,
      group_ids: checkin.groups.map((group) => { return group.id; }),
      user_ids: checkin.users.map((user) => { return user.id; }),
      schedule: checkin.schedule
    };
    if (checkin.self_test_check_in) {
      params['self_test_check_in'] = 1;
    }
    return params;
  }

  // create a check-in without sending
  public createCheckin(organization:Organization, checkin:Checkin):Promise<Checkin> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/checkins`;
        let params = this.getCheckInParams(organization, checkin);
        params.recipients = [];
        this.httpPost(url, params, token.access_token).then((data:any) => {
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

  public sendCheckin(organization:Organization, checkin:Checkin):Promise<Checkin> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/checkins`;
        let params = this.getCheckInParams(organization, checkin);
        this.httpPost(url, params, token.access_token).then((data:any) => {
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

  public updateCheckin(organization:Organization, checkin:Checkin):Promise<Checkin> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/checkins/${checkin.id}`;
        let params = this.getCheckInParams(organization, checkin);
        delete params.recipients;
        this.httpPut(url, params, token.access_token).then((data:any) => {
          if (data && data.checkin) {
            let checkin = new Checkin(data.checkin);
            resolve(checkin);
          }
          else {
            reject("Checkin Not Updated");
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

  public resendCheckin(organization:Organization, checkin:Checkin):Promise<Checkin> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/checkins/${checkin.id}`;
        let params = this.getCheckInParams(organization, checkin);
        this.httpPut(url, params, token.access_token).then((data:any) => {
          if (data && data.checkin) {
            let checkin = new Checkin(data.checkin);
            resolve(checkin);
          }
          else {
            reject("Checkin Not Resent");
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

  public deleteCheckin(organization:Organization, checkin:Checkin):Promise<Checkin> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/checkins/${checkin.id}`;
        let params = { };
        this.httpDelete(url, params, token.access_token).then((data:any) => {
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

  public sendReply(organization:Organization, checkin:Checkin, reply:Reply):Promise<Reply> {
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
        this.httpPost(url, params, token.access_token).then((data:any) => {
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

  public updateReply(organization:Organization, checkin:Checkin, reply:Reply):Promise<Reply> {
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
        this.httpPut(url, params, token.access_token).then((data:any) => {
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

  public tokenReply(checkin:Checkin, reply:Reply, token:string):Promise<Reply> {
    return new Promise((resolve, reject) => {
      let url = `${this.api}/checkins/${checkin.id}/replies`;
      let params = {
        token: token,
        answer: reply.answer
      };
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
      this.httpPost(url, params).then((data:any) => {
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
    });
  }

  public getNotifications(organization:Organization, person:Person, limit:number=20, offset:number=0, unread:number=0):Promise<Notification[]> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/people/${person.id}/notifications`;
        let params = {
          limit: limit,
          offset: offset,
          unread: unread
        };
        this.httpGet(url, params, token.access_token).then((data:any) => {
          if (data && data.notifications) {
            let notifications = [];
            for (let _notification of data.notifications) {
              let notification = new Notification(_notification);
              this.logger.info(this, "getNotifications", "Notification", notification);
              notifications.push(notification);
            }
            resolve(notifications);
          }
          else {
            resolve([]);
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

  public markNotificationAsRead(organization:Organization, user:User, notification:Notification):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/people/${user.id}/notifications/${notification.id}`;
        let params = { };
        this.httpPut(url, params, token.access_token).then((data:any) => {
          if (data && data.notification) {
            resolve(true);
          }
          else {
            resolve(false);
          }
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

  public markAllNotificationsAsRead(organization:Organization, user:User):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/people/${user.id}/notifications`;
        let params = {
          id: user.id,
          name: user.name
        };
        this.httpPut(url, params, token.access_token).then((data:any) => {
          if (data && data.notifications) {
            resolve(true);
          }
          else {
            resolve(false);
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

  public getUnreadNotifications(organization:Organization, user:User, limit:number=20, offset:number=0):Promise<Notification[]> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/people/${user.id}/notifications`;
        let params = {
          unread: 1
        };
        this.httpGet(url, params, token.access_token).then((data:any) => {
          if (data && data.notifications) {
            let notifications = [];
            for (let _notification of data.notifications) {
              let notification = new Notification(_notification);
              notifications.push(notification);
            }
            resolve(notifications);
          }
          else {
            resolve([]);
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
        this.httpGet(url, params, token.access_token).then((data:any) => {
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

  public getGroups(organization:Organization, limit:number=null, offset:number=null):Promise<Group[]> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/groups`;
        let params = { };
        if (limit != null) {
          params['limit'] = limit;
        }
        if (offset != null) {
          params['offset'] = offset;
        }
        this.httpGet(url, params, token.access_token).then((data:any) => {
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
        this.httpGet(url, params, token.access_token).then((data:any) => {
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
        this.httpPost(url, params, token.access_token).then((data:any) => {
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
        this.httpPut(url, params, token.access_token).then((data:any) => {
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
        this.httpDelete(url, params, token.access_token).then((data:any) => {
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

  public getGroupsForPerson(organization:Organization, person:Person, limit:number=null, offset:number=null):Promise<Group[]> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/groups`;
        let params = { };
        if (limit != null) {
          params['limit'] = limit;
        }
        if (offset != null) {
          params['offset'] = offset;
        }
        this.httpGet(url, params, token.access_token).then((data:any) => {
          if (data && data.groups) {
            let groups = [];
            for (let _group of data.groups) {
              let group = new Group(_group);
              if (group.isMember(person)) {
                groups.push(group);
              }
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

  public getGroupMembers(organization:Organization, group:Group):Promise<Person[]> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/groups/${group.id}`;
        let params = { };
        this.httpGet(url, params, token.access_token).then((data:any) => {
          if (data && data.group) {
            let group = new Group(data.group);
            if (group.members) {
              let sorted = group.members.sort((a, b) => {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
              });
              resolve(sorted);
            }
            else {
              resolve([]);
            }
          }
          else {
            resolve([]);
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

  public getSubscriptions(organization:Organization):Promise<Subscription[]> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/subscriptions`;
        let params = { };
        this.httpGet(url, params, token.access_token).then((data:any) => {
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

  public deleteSubscription(organization:Organization, subscription:Subscription):Promise<Subscription> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/subscriptions/${subscription.id}`;
        let params = { };
        this.httpDelete(url, params, token.access_token).then((data:any) => {
          resolve(new Subscription(data.subscription));
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
        this.httpGet(url, params, token.access_token).then((data:any) => {
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

  public getPaymentUrl(organization:Organization, subscription:Subscription, action:string):Promise<string> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let callback = encodeURIComponent(window.location.toString());
        let url = `${this.api}/api/v1/organizations/${organization.id}/subscriptions/${subscription.id}/hostedpage/${action}?callback=${callback}`;
        let params = {
        };
        this.logger.info(this, "getPaymentUrl", url);
        this.httpGet(url, params, token.access_token).then((data:any) => {
          if (data && data.url) {
            this.logger.info(this, "getPaymentUrl", url, data.url);
            resolve(data.url);
          }
          else {
            reject("Payment Not Found");
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

  public getReplies(organization:Organization, checkin:Checkin):Promise<Reply[]> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/checkins/${checkin.id}`;
        let params = { };
        this.httpGet(url, params, token.access_token).then((data:any) => {
          if (data && data.checkin && data.checkin.replies) {
            let checkin = new Checkin(data.checkin);
            resolve(checkin.replies);
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

  public unsubscribeEmail(email:string, token:string):Promise<void> {
    return new Promise((resolve, reject) => {
      let url = `${this.api}/unsubscribe`;
        let params = {
          email: email,
          token: token
        };
        this.logger.info(this, "unsubscribeEmail", url);
        this.httpPost(url, params).then((data:any) => {
          resolve();
        },
        (error:any) => {
          reject(error);
        });
    });
  }

  public resetPassword(subdomain:string, email:string):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let url = `${this.api}/password/email`;
      let params = {
        subdomain: subdomain,
        username: email
      };
      this.httpPost(url, params).then((data:any) => {
        resolve(true);
      },
      (error:any) => {
        reject(`There was a problem resetting password for ${email}.`);
      });
    });
  }

  public updatePassword(subdomain:string, token:string, email:string, password:string):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let url = `${this.api}/password/reset`;
      let params = {
        subdomain: subdomain,
        password: password,
        password_confirmation: password,
        username: email,
        token: token
      };
      this.httpPost(url, params).then((data:any) => {
        resolve(true);
      },
      (error:any) => {
        reject(`There was a problem resetting password for ${email}.`);
      });
    });
  }

  public deleteOrganization(organization:Organization):Promise<any> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}`;
        let params = { };
        this.httpDelete(url, params, token.access_token).then((data:any) => {
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

  public uploadContactsCSV(organization:Organization, file:any):Promise<any> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/files`;
        this.fileUpload(url, token.access_token, file).then((data:any) => {
          resolve(data);
        },
        (error:any) => {
          reject(`Could not process the CSV, please check the file format and column names and try again`);
        });
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  public matchCSVContacts(organization:Organization, map:any, data:any):Promise<any> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        // Initialize a new array of the length of the csv column with nulls
        let maps_to = [];
        let columns = data.file.columns;

        for (let i = 0; i < Object.keys(columns).length; i++) {
          maps_to.push(null);
        }
        // iterate through the map Object, check if value is null and replace any null with value
        // insert this into the maps_to array in the correct positions
        for (let i=0; i<columns.length; i++) {
          for (let mapKey of Object.keys(map)) {
            if (map[mapKey] === columns[i]) {
              maps_to[i] = mapKey;
            }
          }
        }
        let params = {
          fileId: data.file.id,
          orgId: organization.id,
          maps_to: maps_to
        };
        let url = `${this.api}/api/v1/organizations/${organization.id}/files/${data.file.id}`;
        this.httpPut(url, params, token.access_token).then((data:any) => {
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

  public importContacts(organization:any, data:any):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let params = {
          fileId: data.file.id,
          orgId: organization.id
        };
        let url = `${this.api}/api/v1/organizations/${organization.id}/files/${data.file.id}/contacts`;
        this.httpPost(url, params, token.access_token).then((data:any) => {
          resolve(true);
        },
        (error:any) => {
          this.logger.error(this, "import", token, "Error", error);
          reject(error);
        });
      },
      (error:any) => {
        reject(error);
      });
    });
  }

  public addCredits(organization:Organization, subscription:Subscription, quantity:number):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/subscriptions/${subscription.id}/credits`;
        let params = { quantity: quantity };
        this.httpPost(url, params, token.access_token).then((data:any) => {
          resolve(true);
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

  public updateFirebase(organization:Organization, person:Person, firebase:string):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/people/${person.id}/tokens`;
        let params = {
          token: firebase
        };
        this.httpPost(url, params, token.access_token).then((data:any) => {
          resolve(true);
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

  public lookupOrganization(email:string):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let url = `${this.api}/organization/lookup`;
      let params = {
        email: email
      };
      this.httpPost(url, params).then((data:any) => {
        resolve(true);
      }, reject);
    });
  }

  public notifyPerson(organization:Organization, person:any, message:string):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.getToken(organization).then((token:Token) => {
        let url = `${this.api}/api/v1/organizations/${organization.id}/people/${person}/notify`;
        let params = {
          message: message
        };
        this.httpPost(url, params, token.access_token).then((data:any) => {
          resolve(true);
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
