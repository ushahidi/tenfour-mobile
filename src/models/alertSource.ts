import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, BOOLEAN, PRIMARY_KEY } from '../models/model';
import { Organization } from './organization';

@Table("alert_source")
export class AlertSource extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
  }

  public newInstance<M extends AlertSource>(data:any=null):any {
    return new AlertSource(data);
  }

  @Column("source_id", TEXT, PRIMARY_KEY)
  public source_id:string = null;

  @Column("protocol", TEXT)
  public protocol:string = null;

  @Column("url", TEXT)
  public url:string = null;

  @Column("enabled", BOOLEAN)
  public enabled:boolean = null;

  @Column("name", TEXT)
  public name:string = null;

}
