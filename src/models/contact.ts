import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, DOUBLE, BOOLEAN, PRIMARY_KEY } from '../models/model';

@Table("contacts")
export class Contact extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
  }

  public newInstance<M extends Contact>(data:any=null):Contact {
    return new Contact(data);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id:number = null;

  @Column("type", TEXT)
  public type:string = null;

  @Column("contact", TEXT)
  public contact:string = null;

  @Column("gravatar", TEXT)
  public gravatar:string = null;

  @Column("uri", TEXT)
  public uri:string = null;

}
