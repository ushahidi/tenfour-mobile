import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, BOOLEAN, PRIMARY_KEY } from '../models/model';
import { Contact } from '../models/contact';
import { Checkin } from '../models/checkin';
import { Reply } from '../models/reply';
import { Group } from '../models/group';
import { Notification } from '../models/notification';

@Table("people")
export class Person extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
    if (data) {
      if (data.contacts && data.contacts.length > 0) {
        this.contacts = [];
        for (let _contact of data.contacts) {
          let contact = new Contact(_contact);
          this.contacts.push(contact);
        }
      }
      if (data.notifications && data.notifications.length > 0) {
        this.notifications = [];
        for (let _notification of data.notifications) {
          let notification = new Notification(_notification);
          this.notifications.push(notification);
        }
      }
      if (data.name && data.initials == null) {
        this.initials = data.name.split(" ").map((n)=>n[0]).join("").substring(0, 3);
      }
      if (data.checkins && data.checkins.length > 0) {
        this.checkins = [];
        for (let _checkin of data.checkins) {
          let checkin = new Checkin(_checkin);
          checkin.user_id = this.id;
          checkin.user_name = this.name;
          checkin.user_initials = this.initials;
          checkin.user_picture = this.profile_picture;
          this.checkins.push(checkin);
        }
      }
      if (data.replies && data.replies.length > 0) {
        this.replies = [];
        for (let _reply of data.replies) {
          let reply = new Reply(_reply);
          reply.user_id = this.id;
          reply.user_name = this.name;
          reply.user_initials = this.initials;
          reply.user_picture = this.profile_picture;
          this.replies.push(reply);
        }
      }
      if (data.groups && data.groups.length > 0) {
        this.groups = [];
        for (let _group of data.groups) {
          let group = new Group(_group);
          this.groups.push(group);
        }
      }
    }
  }

  public newInstance<M extends Person>(data:any=null):Person {
    return new Person(data);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id:number = null;

  @Column("organization_id", INTEGER)
  public organization_id:number = null;

  @Column("me", BOOLEAN)
  public me:boolean = null;

  @Column("name", TEXT)
  public name:string = null;

  @Column("initials", TEXT)
  public initials:string = null;

  @Column("description", TEXT)
  public description:string = null;

  @Column("person_type", TEXT)
  public person_type:string = null;

  @Column("profile_picture", TEXT)
  public profile_picture:string = null;

  @Column("group_ids", TEXT)
  public group_ids:string = null;

  @Column("role", TEXT)
  public role:string = null;

  @Column("uri", TEXT)
  public uri:string = null;

  @Column("gravatar", TEXT)
  public gravatar:string = null;

  @Column("invite_sent", BOOLEAN)
  public invite_sent:boolean = false;

  @Column("config_profile_reviewed", BOOLEAN)
  public config_profile_reviewed:boolean = null;

  @Column("config_self_test_sent", BOOLEAN)
  public config_self_test_sent:boolean = null;

  @Column("config_people_invited", BOOLEAN)
  public config_people_invited:boolean = null;

  @Column("first_time_login", BOOLEAN)
  public first_time_login:boolean = null;

  @Column("has_logged_in", BOOLEAN)
  public has_logged_in:boolean = null;

  @Column("blocked", BOOLEAN)
  public blocked:boolean = null;

  @Column("created_at", TEXT)
  public created_at:Date = null;

  @Column("updated_at", TEXT)
  public updated_at:Date = null;

  @Column("source", TEXT)
  public source:string = null;

  public selected:boolean = null;

  public contacts:Contact[] = [];

  public groups:Group[] = [];

  public checkins:Checkin[] = [];

  public replies:Reply[] = [];

  public notifications:Notification[] = [];

  public isMe():boolean {
    return this.me != null && this.me == true;
  }

  public isOwnerOrAdmin():boolean {
    return this.role === 'owner' || this.role === 'admin';
  }

  public isOwner():boolean {
    return this.role === 'owner';
  }

  public isAdmin():boolean {
    return this.role === 'admin';
  }

  public isAuthor():boolean {
    return this.role === 'author';
  }

  public isViewer():boolean {
    return this.role === 'viewer';
  }

  public isResponder():boolean {
    return this.role === 'responder';
  }

  public getEmails():Contact[] {
    return this.contacts.filter(function(contact) {
      return contact.type == 'email';
    });
  }

  public getPhones():Contact[] {
    return this.contacts.filter(function(contact) {
      return contact.type == 'phone';
    });
  }

  public getAddresses():Contact[] {
    return this.contacts.filter(function(contact) {
      return contact.type == 'address';
    });
  }

  public hasEmails():boolean {
    let emails = this.getEmails();
    return emails && emails.length > 0;
  }

  public hasPhones():boolean {
    let phones = this.getPhones();
    return phones && phones.length > 0;
  }

  public hasEmail(email:string):boolean {
    for (let contact of this.getEmails()) {
      if (contact.contact == email) {
        return true;
      }
    }
    return false;
  }

  public isExternal():boolean {
    return this.person_type === 'external';
  }

  public needsInvite():boolean {
    if (this.isExternal()) {
      return false;
    }

    if (this.has_logged_in == false) {
      return this.hasEmails();
    }
    return false;
  }

  public groupNames(separator:string=", "):string {
    if (this.groups && this.groups.length > 0) {
      let groupNames = [];
      for (let group of this.groups) {
        groupNames.push(group.name);
      }
      return groupNames.join(separator);
    }
    return "";
  }

  public groupIds():number[] {
    let ids = [];
    if (this.groups && this.groups.length > 0) {
      for (let group of this.groups) {
        ids.push({id: group.id});
      }
    }
    return ids;
  }

}
