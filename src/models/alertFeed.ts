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
  }

  public newInstance<M extends AlertFeed>(data:any=null):any {
    return new AlertFeed(data);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id:number = null;

  @Column("country", TEXT)
  public country:string = null;

  @Column("city", TEXT)
  public city:string = null;

  @Column("sourceType", TEXT)
  public sourceType:string = null;

  @Column("sourceConfig", TEXT)
  public sourceConfig:string = null;

  @Column("organization_id", INTEGER)
  public organization_id:number = null;

  public organization:Organization[] = [];

}
