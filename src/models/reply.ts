import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, DOUBLE, BOOLEAN, PRIMARY_KEY } from '../models/model';

@Table("replies")
export class Reply extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
  }

  public newInstance<M extends Reply>(data:any=null):Reply {
    return new Reply(data);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id:number = null;

  @Column("organization_id", INTEGER)
  public organization_id:number = null;

  @Column("rollcall_id", INTEGER)
  public rollcall_id:number = null;

  @Column("contact_id", INTEGER)
  public contact_id:number = null;

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

  @Column("message_id", INTEGER)
  public message_id:number = null;

  @Column("message", TEXT)
  public message:string = null;

  @Column("location_text", TEXT)
  public location_text:string = null;

  @Column("answer", TEXT)
  public answer:string = null;

  @Column("created_at", TEXT)
  public created_at:Date = null;

  @Column("updated_at", TEXT)
  public updated_at:Date = null;

  @Column("saved_at", TEXT)
  public saved_at:Date = null;

}
