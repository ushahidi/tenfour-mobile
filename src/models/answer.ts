import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, DOUBLE, BOOLEAN, PRIMARY_KEY } from '../models/model';

@Table("answers")
export class Answer extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
  }

  public newInstance<M extends Answer>(data:any=null):Answer {
    return new Answer(data);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id:number = null;

  @Column("organization_id", INTEGER)
  public organization_id:number = null;

  @Column("rollcall_id", INTEGER)
  public rollcall_id:number = null;

  @Column("type", TEXT)
  public type:string = null;

  @Column("icon", TEXT)
  public icon:string = null;

  @Column("answer", TEXT)
  public answer:string = null;

  @Column("color", TEXT)
  public color:string = null;

  @Column("saved_at", TEXT)
  public saved_at:Date = null;

}
