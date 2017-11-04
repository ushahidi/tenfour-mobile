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
      if (data.data.rollcall_id) {
        this.rollcall_id = data.data.rollcall_id;
      }
      if (data.data.rollcall_message) {
        this.rollcall_message = data.data.rollcall_message;
      }
      if (data.data.person_id) {
        this.person_id = data.data.person_id;
      }
      if (data.data.person_name) {
        this.person_name = data.data.person_name;
      }
      if (data.data.initials) {
        this.person_initials = data.data.initials;
      }
      if (data.data.profile_picture && data.data.profile_picture.toString().indexOf("http") != -1) {
        this.person_picture = data.data.profile_picture;
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

  @Column("rollcall_id", INTEGER)
  public rollcall_id:number = null;

  @Column("person_id", INTEGER)
  public person_id:number = null;

  @Column("type", TEXT)
  public type:string = null;

  @Column("notifiable_type", TEXT)
  public notifiable_type:string = null;

  @Column("reply_from", TEXT)
  public reply_from:string = null;

  @Column("rollcall_message", TEXT)
  public rollcall_message:string = null;

  @Column("person_name", TEXT)
  public person_name:string = null;

  @Column("person_initials", TEXT)
  public person_initials:string = null;

  @Column("person_picture", TEXT)
  public person_picture:string = null;

  @Column("read_at", TEXT)
  public read_at:Date = null;

  @Column("viewed_at", TEXT)
  public viewed_at:Date = null;

  @Column("created_at", TEXT)
  public created_at:Date = null;

  @Column("updated_at", TEXT)
  public updated_at:Date = null;

}
