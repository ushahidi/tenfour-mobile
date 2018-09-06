import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, PRIMARY_KEY } from '../models/model';
import { Person } from '../models/person';

@Table("groups")
export class Group extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
    if (data && data.members) {
      this.members = [];
      for (let member of data.members) {
        let person = new Person(member);
        this.members.push(person);
      }
      this.member_count = this.members.length;
      this.member_ids = this.members.map((person:Person) => person.id).join(",");
    }
  }

  public newInstance<M extends Group>(data:any=null):Group {
    return new Group(data);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id:number = null;

  @Column("organization_id", INTEGER)
  public organization_id:number = null;

  @Column("name", TEXT)
  public name:string = null;

  @Column("description", TEXT)
  public description:string = null;

  @Column("uri", TEXT)
  public uri:string = null;

  @Column("member_count", INTEGER)
  public member_count:number = null;

  @Column("member_ids", TEXT)
  public member_ids:string = null;

  @Column("created_at", TEXT)
  public created_at:Date = null;

  @Column("updated_at", TEXT)
  public updated_at:Date = null;

  @Column("source", TEXT)
  public source:string = null;

  public members:Person[] = [];

  public selected:boolean = null;

  public loadMembers(people:Person[]) {
    if (this.member_ids) {
      let memberIds = this.member_ids.split(",");
      this.members = people.filter((person:Person) => { memberIds.indexOf(person.id.toString()) != -1});
    }
  }

  public memberIds():number[] {
    let ids = [];
    if (this.members && this.members.length > 0) {
      for (let member of this.members) {
        ids.push({id: member.id});
      }
    }
    return ids;
  }

  public isMember(person:Person):boolean {
    if (person && this.member_ids) {
      let memberIds = this.member_ids.split(",");
      for (let memberId of memberIds) {
        if (memberId === person.id.toString()) {
          return true;
        }
      }
    }
    return false;
  }

  public isExternal():boolean {
    return this.source && this.source.length && this.source !== 'local';
  }
}
