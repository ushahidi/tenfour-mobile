import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, DOUBLE, BOOLEAN, PRIMARY_KEY } from '../models/model';

@Table("tokens")
export class Token extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
  }

  public newInstance<M extends Token>(data:any=null):Token {
    return new Token(data);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id:number = null;

  @Column("organization_id", INTEGER)
  public organization_id:number = null;

  @Column("access_token", TEXT)
  public access_token:string = null;

  @Column("token_type", TEXT)
  public token_type:string = null;

  @Column("expires_in", INTEGER)
  public expires_in:number = null;

  @Column("refresh_token", TEXT)
  public refresh_token:string = null;

}
