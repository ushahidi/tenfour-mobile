import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, BOOLEAN, PRIMARY_KEY } from '../models/model';

@Table("countries")
export class Country extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
  }

  public newInstance<Country>(data:any=null):any {
    return new Country(data);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id:number = null;

  @Column("organization_id", INTEGER)
  public organization_id:number = null;

  @Column("code", TEXT)
  public code:string = null;

  @Column("country_code", INTEGER)
  public country_code:number = null;

  @Column("name", TEXT)
  public name:string = null;

  @Column("image", TEXT)
  public image:string = null;

  @Column("_default", BOOLEAN)
  public default:boolean = null;

  @Column("selected", BOOLEAN)
  public selected:boolean = null;

  @Column("created_at", TEXT)
  public created_at:Date = null;

  @Column("updated_at", TEXT)
  public updated_at:Date = null;

}
