import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, DOUBLE, BOOLEAN, PRIMARY_KEY } from '../models/model';
import { Person } from '../models/person';
import { Answer } from '../models/answer';
import { Reply } from '../models/reply';

@Table("rollcalls")
export class Rollcall extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
    if (data && data.user) {
      this.user_id = data.user.id;
      this.user_name = data.user.name;
      this.user_description = data.user.description;
      this.user_initials = data.user.initials;
      this.user_picture = data.user.profile_picture;
    }
  }

  public newInstance<M extends Rollcall>(data:any=null):Rollcall {
    return new Rollcall(data);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id:number = null;

  @Column("organization_id", INTEGER)
  public organization_id:number = null;

  @Column("user_id", INTEGER)
  public user_id:number = null;

  @Column("user_name", TEXT)
  public user_name:string = null;

  @Column("user_description", TEXT)
  public user_description:string = null;

  @Column("user_picture", TEXT)
  public user_picture:string = null;

  @Column("user_initials", TEXT)
  public user_initials:string = null;

  @Column("message", TEXT)
  public message:string = null;

  @Column("status", TEXT)
  public status:string = null;

  @Column("send_via", TEXT)
  public send_via:string = null;

  @Column("complaint_count", INTEGER)
  public complaint_count:number = null;

  @Column("reply_count", INTEGER)
  public reply_count:number = null;

  @Column("sent_count", INTEGER)
  public sent_count:number = null;

  @Column("sent", BOOLEAN)
  public sent:boolean = null;

  @Column("uri", TEXT)
  public uri:string = null;

  @Column("created_at", TEXT)
  public created_at:Date = null;

  @Column("updated_at", TEXT)
  public updated_at:Date = null;

  @Column("saved_at", TEXT)
  public saved_at:Date = null;

  public user:Person = null;

  public answers:Answer[] = [];

  public recipients:Person[] = [];

  public replies:Reply[] = [];

}
