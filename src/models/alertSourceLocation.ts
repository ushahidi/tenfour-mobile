import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, BOOLEAN, PRIMARY_KEY } from '../models/model';

@Table("alert_source_location")
export class AlertSourceLocation extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
  }

  public newInstance<M extends AlertSourceLocation>(data:any=null):any {
    return new AlertSourceLocation(data);
  }

  @Column("country", TEXT)
  public country:string = null;

  @Column("state", TEXT)
  public state:string = null;

}
