import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, BOOLEAN, PRIMARY_KEY } from '../models/model';

@Table("recipients")
export class Recipient extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
  }

  public newInstance<M extends Recipient>(data:any=null):Recipient {
    return new Recipient(data);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id:number = null;

  @Column("organization_id", INTEGER)
  public organization_id:number = null;

  @Column("rollcall_id", INTEGER)
  public rollcall_id:number = null;

  @Column("name", TEXT)
  public name:string = null;

  @Column("role", TEXT)
  public role:string = null;

  @Column("initials", TEXT)
  public initials:string = null;

  @Column("description", TEXT)
  public description:string = null;

  @Column("response_status", TEXT)
  public response_status:string = null;

  @Column("profile_picture", TEXT)
  public profile_picture:string = null;

  @Column("person_type", TEXT)
  public person_type:string = null;

  @Column("uri", TEXT)
  public uri:string = null;

  @Column("gravatar", TEXT)
  public gravatar:string = null;

  @Column("invite_sent", BOOLEAN)
  public invite_sent:boolean = null;

  @Column("first_time_login", BOOLEAN)
  public first_time_login:boolean = null;

  @Column("config_profile_reviewed", BOOLEAN)
  public config_profile_reviewed:boolean = null;

  @Column("config_self_test_sent", BOOLEAN)
  public config_self_test_sent:boolean = null;

  @Column("created_at", TEXT)
  public created_at:Date = null;

  @Column("updated_at", TEXT)
  public updated_at:Date = null;

  @Column("saved_at", TEXT)
  public saved_at:Date = null;

}