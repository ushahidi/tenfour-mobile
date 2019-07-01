import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, BOOLEAN, PRIMARY_KEY } from '../models/model';
import { AlertFeed } from './alertFeed';
import { User } from './user';
import { Group } from './group';
import { Checkin } from './checkin';

@Table("alert_source")
export class AlertSubscription extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
  }

  public newInstance<M extends AlertSubscription>(data:any=null):any {
    return new AlertSubscription(data);
  }
  @Column("id", INTEGER, PRIMARY_KEY)
  public id:number = null;

  @Column("checkin_template_id", INTEGER)
  public checkin_template_id:number = null;

  @Column("feed_id", INTEGER)
  public feed_id:number = null;

  @Column("created_at", TEXT)
  public created_at:Date = null;

  @Column("updated_at", TEXT)
  public updated_at:Date = null;

  public feed:AlertFeed = null;
  public checkinTemplate:Checkin = null;
  public user:User = null;
  public group:Group = null;

}
