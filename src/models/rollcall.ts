import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, DOUBLE, BOOLEAN, PRIMARY_KEY } from '../models/model';
import { Person } from '../models/person';
import { Recipient } from '../models/recipient';
import { Answer } from '../models/answer';
import { Reply } from '../models/reply';

@Table("rollcalls")
export class Rollcall extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
    if (data) {
      if (data.user) {
        this.user_id = data.user.id;
        this.user_name = data.user.name;
        this.user_description = data.user.description;
        this.user_initials = data.user.initials;
        this.user_picture = data.user.profile_picture;
      }
      if (data.answers) {
        this.answers = [];
        for (let i = 0; i < data.answers.length; i++) {
          let answer = new Answer(data.answers[i]);
          answer.id = Number(`${data.id}${i+1}`);
          if (data.replies) {
            answer.replies = data.replies.filter(reply => reply.answer == answer.answer).length;
          }
          else {
            answer.replies = 0;
          }
          this.answers.push(answer);
        }
      }
      if (data.recipients) {
        this.recipients = [];
        for (let _recipient of data.recipients) {
          let person = new Recipient(_recipient);
          this.recipients.push(person);
        }
      }
      if (data.replies) {
        this.replies = [];
        for (let _reply of data.replies) {
          let reply = new Reply(_reply);
          if (data.recipients) {
            let recipient = data.recipients.find(recipient => recipient.id == _reply.user_id);
            if (recipient) {
              reply.user_name = recipient.name;
              reply.user_initials = recipient.initials;
              reply.user_description = recipient.description;
              reply.user_picture = recipient.profile_picture;
            }
          }
          this.replies.push(reply);
        }
        if (data.recipients) {
          this.waiting_count = data.recipients.length - data.replies.length;
        }
      }
    }
  }

  public newInstance<M extends Rollcall>(data:any=null):Rollcall {
    return new Rollcall(data);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id:number = null;

  @Column("organization_id", INTEGER)
  public organization_id:number = null;

  @Column("user_id", INTEGER)
  public user_id:number = null;

  @Column("user_name", TEXT)
  public user_name:string = null;

  @Column("user_description", TEXT)
  public user_description:string = null;

  @Column("user_picture", TEXT)
  public user_picture:string = null;

  @Column("user_initials", TEXT)
  public user_initials:string = null;

  @Column("message", TEXT)
  public message:string = null;

  @Column("status", TEXT)
  public status:string = null;

  @Column("send_via", TEXT)
  public send_via:string = null;

  @Column("complaint_count", INTEGER)
  public complaint_count:number = null;

  @Column("reply_count", INTEGER)
  public reply_count:number = null;

  @Column("waiting_count", INTEGER)
  public waiting_count:number = null;

  @Column("sent_count", INTEGER)
  public sent_count:number = null;

  @Column("replied", BOOLEAN)
  public replied:boolean = null;

  @Column("sent", BOOLEAN)
  public sent:boolean = null;

  @Column("uri", TEXT)
  public uri:string = null;

  @Column("created_at", TEXT)
  public created_at:Date = null;

  @Column("updated_at", TEXT)
  public updated_at:Date = null;

  @Column("saved_at", TEXT)
  public saved_at:Date = null;

  public user:Person = null;

  public answers:Answer[] = [];

  public recipients:Recipient[] = [];

  public replies:Reply[] = [];

  answerReplies(answer:Answer):Reply[] {
    if (this.replies && this.replies.length > 0) {
      return this.replies.filter(reply => reply.answer == answer.answer);
    }
    return [];
  }

  recipientsPending():Recipient[] {
    let _recipients = [];
    for (let recipient of this.recipients) {
      if (this.replies == null || this.replies.length == 0) {
        _recipients.push(recipient);
      }
      else if (this.replies.filter(reply => reply.user_id == recipient.id).length == 0) {
        _recipients.push(recipient);
      }
    }
    return _recipients;
  }

}
