import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, BOOLEAN, PRIMARY_KEY } from '../models/model';
import { Organization } from './organization';
import { AlertFeed } from './alertFeed';

@Table("alert_feed_entry")
export class AlertFeedEntry extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
    if (data && data.feed) {
      this.feed_id = data.feed.id;
    }
  }

  public newInstance<M extends AlertFeedEntry>(data:any=null):any {
    return new AlertFeedEntry(data);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id:number = null;

  @Column("feed_id", INTEGER)
  public feed_id:number = null;

  @Column("title", TEXT)
  public title:string = null;

  @Column("body", TEXT)
  public body:string = null;

  @Column("metadata", TEXT)
  public metadata:string = null;

  @Column("created_at", TEXT)
  public created_at:Date = null;

  @Column("updated_at", TEXT)
  public updated_at:Date = null;

  public feed:AlertFeed = null;
}
