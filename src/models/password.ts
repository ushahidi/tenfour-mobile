import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, PRIMARY_KEY } from '../models/model';

@Table("passwords")
export class Password extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
  }

  public newInstance<M extends Password>(data:any=null):Password {
    return new Password(data);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id:number = null;

  @Column("organization_id", INTEGER)
  public organization_id:number = null;

  @Column("address", TEXT)
  public address:string = null;

  @Column("created_at", TEXT)
  public created_at:Date = null;

  @Column("updated_at", TEXT)
  public updated_at:Date = null;

}