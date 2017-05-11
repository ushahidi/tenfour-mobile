import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, DOUBLE, BOOLEAN, PRIMARY_KEY } from '../models/model';

@Table("people")
export class Person extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
  }

  public newInstance<M extends Person>(data:any=null):Person {
    return new Person(data);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id:number = null;

  @Column("name", TEXT)
  public name:string = null;

  @Column("description", TEXT)
  public description:string = null;

  @Column("person_type", TEXT)
  public person_type:string = null;

  @Column("profile_picture", TEXT)
  public profile_picture:string = null;

  @Column("role", TEXT)
  public role:string = null;

  @Column("organization_id", INTEGER)
  public organization_id:number = null;

  @Column("uri", TEXT)
  public uri:string = null;

}
