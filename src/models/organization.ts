import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, PRIMARY_KEY } from '../models/model';
import { Person } from '../models/person';
import { Rollcall } from '../models/rollcall';
import { Group } from '../models/group';

@Table("organizations")
export class Organization extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
    if (data && data.user) {
      this.user_id = data.user.id;
    }
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

  @Column("email", TEXT)
  public email:string = null;

  @Column("password", TEXT)
  public password:string = null;

  @Column("user_id", INTEGER)
  public user_id:number = null;

  @Column("user_name", TEXT)
  public user_name:string = null;

  @Column("uri", TEXT)
  public uri:string = null;

  @Column("created_at", TEXT)
  public created_at:Date = null;

  @Column("updated_at", TEXT)
  public updated_at:Date = null;

  @Column("saved_at", TEXT)
  public saved_at:Date = null;

  public people:Person[] = [];

  public rollcalls:Rollcall[] = [];

  public groups:Group[] = [];

}
