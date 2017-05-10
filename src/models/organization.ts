import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, DOUBLE, BOOLEAN, PRIMARY_KEY } from '../models/model';

@Table("organizations")
export class Organization extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
  }

  public newInstance<M extends Organization>(data:any=null):Organization {
    return new Organization(data);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id:number = null;

  @Column("name", TEXT)
  public name:string = null;

  @Column("subdomain", TEXT)
  public subdomain:string = null;

  @Column("profile_picture", TEXT)
  public profile_picture:string = null;

}
