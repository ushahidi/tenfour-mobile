import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, BOOLEAN, PRIMARY_KEY } from '../models/model';
import { Contact } from '../models/contact';
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

  @Column("role", TEXT)
  public role:string = null;

  @Column("uri", TEXT)
  public uri:string = null;

  @Column("gravatar", TEXT)
  public gravatar:string = null;

  @Column("invite_sent", INTEGER)
  public invite_sent:number = null;

  @Column("config_profile_reviewed", BOOLEAN)
  public config_profile_reviewed:boolean = null;

  @Column("config_self_test_sent", BOOLEAN)
  public config_self_test_sent:boolean = null;

  @Column("config_added_people", BOOLEAN)
  public config_added_people:boolean = null;

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

  @Column("saved_at", TEXT)
  public saved_at:Date = null;

  public selected:boolean = null;

  public contacts:Contact[] = [];

  public notifications:Notification[] = [];

  getEmails() {
    return this.contacts.filter(function(contact) {
      return contact.type == 'email';
    });
  }

  getPhones() {
    return this.contacts.filter(function(contact) {
      return contact.type == 'phone';
    });
  }

}
