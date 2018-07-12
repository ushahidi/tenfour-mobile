import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, BOOLEAN, PRIMARY_KEY } from '../models/model';

@Table("notifications")
export class Notification extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
    if (data && data.data) {
      if (data.data.reply_from) {
        this.reply_from = data.data.reply_from;
      }
      if (data.data.check_in_id) {
        this.checkin_id = data.data.check_in_id;
      }
      if (data.data.check_in_message) {
        this.checkin_message = data.data.check_in_message;
      }
      if (data.data.person_id) {
        this.person_id = data.data.person_id;
      }
      if (data.data.person_name) {
        this.person_name = data.data.person_name;
      }
      if (data.data.message) {
        this.message = data.data.message;
      }
      if (data.data.contact) {
        this.contact = data.data.contact;
      }
      if (data.data.contact_type) {
        this.contact_type = data.data.contact_type;
      }
      if (data.data.card_type) {
        this.card_type = data.data.card_type;
      }
      if (data.data.last_four) {
        this.card_last_four = data.data.last_four;
      }
      if (data.data.adjustment) {
        this.card_adjustment = data.data.adjustment;
      }
      if (data.data.initials) {
        this.person_initials = data.data.initials;
      }
      if (data.data.profile_picture && data.data.profile_picture.toString().indexOf("http") != -1) {
        this.person_picture = data.data.profile_picture;
      }
      if (data.data.count) {
        this.import_count = data.data.count;
      }
      if (data.data.dupe_count) {
        this.import_dupe_count = data.data.dupe_count;
      }
      if (data.data.estimate) {
        this.billing_estimate = data.data.estimate;
      }
      if (data.data.next_billing_at && data.data.next_billing_at.date) {
        this.billing_next = new Date(data.data.next_billing_at.date);
      }
    }
  }

  public newInstance<M extends Notification>(data:any=null):Notification {
    return new Notification(data);
  }

  @Column("id", TEXT, PRIMARY_KEY)
  public id:string = null;

  @Column("organization_id", INTEGER)
  public organization_id:number = null;

  @Column("notifiable_id", INTEGER)
  public notifiable_id:number = null;

  @Column("type", TEXT)
  public type:string = null;

  @Column("message", TEXT)
  public message:string = null;

  @Column("notifiable_type", TEXT)
  public notifiable_type:string = null;

  @Column("reply_from", TEXT)
  public reply_from:string = null;

  @Column("checkin_id", INTEGER)
  public checkin_id:number = null;
  
  @Column("checkin_message", TEXT)
  public checkin_message:string = null;

  @Column("person_id", INTEGER)
  public person_id:number = null;

  @Column("person_name", TEXT)
  public person_name:string = null;

  @Column("person_initials", TEXT)
  public person_initials:string = null;

  @Column("person_picture", TEXT)
  public person_picture:string = null;

  @Column("contact", TEXT)
  public contact:string = null;

  @Column("contact_type", TEXT)
  public contact_type:string = null;

  @Column("card_type", TEXT)
  public card_type:string = null;

  @Column("card_last_four", INTEGER)
  public card_last_four:number = null;

  @Column("card_adjustment", TEXT)
  public card_adjustment:string = null;

  @Column("import_count", INTEGER)
  public import_count:number = null;

  @Column("import_dupe_count", INTEGER)
  public import_dupe_count:number = null;

  @Column("billing_estimate", INTEGER)
  public billing_estimate:number = null;

  @Column("billing_next", TEXT)
  public billing_next:Date = null;

  @Column("read_at", TEXT)
  public read_at:Date = null;

  @Column("viewed_at", TEXT)
  public viewed_at:Date = null;

  @Column("created_at", TEXT)
  public created_at:Date = null;

  @Column("updated_at", TEXT)
  public updated_at:Date = null;

}
