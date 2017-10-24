import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, BOOLEAN, PRIMARY_KEY } from '../models/model';

@Table("contacts")
export class Contact extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
    if (data && data.meta) {
      this.carrier = data.meta.carrier;
      this.country_code = data.meta.country_code;
      this.national_number = data.meta.national_number;
    }
  }

  public newInstance<M extends Contact>(data:any=null):Contact {
    return new Contact(data);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id:number = null;

  @Column("organization_id", INTEGER)
  public organization_id:number = null;

  @Column("person_id", INTEGER)
  public person_id:number = null;

  @Column("type", TEXT)
  public type:string = null;

  @Column("contact", TEXT)
  public contact:string = null;

  @Column("carrier", TEXT)
  public carrier:string = null;

  @Column("country_code", INTEGER)
  public country_code:number = null;

  @Column("national_number", TEXT)
  public national_number:string = null;

  @Column("gravatar", TEXT)
  public gravatar:string = null;

  @Column("uri", TEXT)
  public uri:string = null;

  @Column("preferred", BOOLEAN)
  public preferred:boolean = null;

  @Column("bounce_count", INTEGER)
  public bounce_count:number = null;

  @Column("blocked", INTEGER)
  public blocked:number = null;

  @Column("created_at", TEXT)
  public created_at:Date = null;

  @Column("updated_at", TEXT)
  public updated_at:Date = null;

  @Column("saved_at", TEXT)
  public saved_at:Date = null;

}
