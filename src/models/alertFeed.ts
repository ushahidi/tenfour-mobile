import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, BOOLEAN, PRIMARY_KEY } from '../models/model';
import { Organization } from './organization';

@Table("alert_feed")
export class AlertFeed extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
    if (data && data.organization) {
      this.organization_id = data.organization.id;
    }
    if (data && data.user) {
      this.owner_id = data.user.id;
    }
  }

  public newInstance<M extends AlertFeed>(data:any=null):any {
    return new AlertFeed(data);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id:number = null;

  @Column("country", TEXT)
  public country:string = null;

  @Column("state", TEXT)
  public state:string = null;

  @Column("source_id", TEXT)
  public source_id:string = null;

  @Column("organization_id", INTEGER)
  public organization_id:number = null;

  @Column("owner_id", INTEGER)
  public owner_id:number = null;

  @Column("automatic", BOOLEAN)
  public automatic:boolean = false;

  @Column("enabled", BOOLEAN)
  public enabled:boolean = false;

  public organization:Organization[] = [];
}
