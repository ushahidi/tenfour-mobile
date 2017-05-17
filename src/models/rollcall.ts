import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, DOUBLE, BOOLEAN, PRIMARY_KEY } from '../models/model';

@Table("rollcalls")
export class RollCall extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
  }

  public newInstance<M extends RollCall>(data:any=null):RollCall {
    return new RollCall(data);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id:number = null;

  @Column("organization_id", INTEGER)
  public organization_id:number = null;

  @Column("user_id", INTEGER)
  public user_id:number = null;

  @Column("user_name", TEXT)
  public user_name:string = null;

  @Column("user_picture", TEXT)
  public user_picture:string = null;

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

}
