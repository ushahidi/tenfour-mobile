import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, BOOLEAN, PRIMARY_KEY } from '../models/model';

@Table("schedules")
export class Schedule extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
  }

  public newInstance<M extends Schedule>(data:any=null):any {
    return new Schedule(data);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id:number = null;

  @Column("scheduled", BOOLEAN)
  public scheduled:boolean = null;

  @Column("frequency", TEXT)
  public frequency:string = null;

  @Column("remaining_count", INTEGER)
  public remaining_count:number = null;

  @Column("starts_at", TEXT)
  public starts_at:string = null;

  @Column("expires_at", TEXT)
  public expires_at:string = null;

  @Column("created_at", TEXT)
  public created_at:Date = null;

  @Column("updated_at", TEXT)
  public updated_at:Date = null;

  public hasStartsAt():boolean {
    return this.starts_at && this.starts_at.length > 0;
  }

  public hasExpiresAt():boolean {
    return this.expires_at && this.expires_at.length > 0;
  }

  public startsAt():Date {
    if (this.starts_at) {
      return new Date(this.starts_at);
    }
    return null;
  }

  public expiresAt():Date {
    if (this.expires_at) {
      return new Date(this.expires_at);
    }
    return null;
  }

}
