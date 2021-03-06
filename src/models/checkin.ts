import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, BOOLEAN, PRIMARY_KEY } from '../models/model';
import { Group } from '../models/group';
import { Person } from '../models/person';
import { User } from '../models/user';
import { Recipient } from '../models/recipient';
import { Answer } from '../models/answer';
import { Reply } from '../models/reply';
import { Schedule } from '../models/schedule';

@Table("checkins")
export class Checkin extends Model {

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
          let recipient = new Recipient(_recipient);
          recipient.id = Number(`${data.id}${_recipient.id}`);
          recipient.user_id = _recipient.id;
          this.recipients.push(recipient);
        }
      }
      if (data.groups) {
        this.group_ids = data.groups.map((group:Group) => group.id).join(",");
      }
      if (data.users) {
        this.user_ids = data.users.map((user:User) => user.id).join(",");
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
          this.waiting_count = this.recipientsPending().length;
        }
      }
      if (data.user) {
        this.user = new User(data.user);
        this.user_name = this.user.name;
        this.user_initials = this.user.initials;
        this.user_picture = this.user.profile_picture;
      }
      if (data.schedule) {
        this.schedule = new Schedule(data.schedule);
      }
      else if (data.scheduled_checkin) {
        this.schedule = new Schedule(data.scheduled_checkin);
      }
    }
  }

  public newInstance<M extends Checkin>(data:any=null):any {
    return new Checkin(data);
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

  @Column("remaining_count", INTEGER)
  public remaining_count:number = null;

  @Column("sent_count", INTEGER)
  public sent_count:number = null;

  @Column("replied", BOOLEAN)
  public replied:boolean = null;

  @Column("self_test_check_in", BOOLEAN)
  public self_test_check_in:boolean = null;

  @Column("sent", BOOLEAN)
  public sent:boolean = null;

  @Column("uri", TEXT)
  public uri:string = null;

  @Column("everyone", BOOLEAN)
  public everyone:boolean = false;

  @Column("template", BOOLEAN)
  public template:boolean = false;

  @Column("send_at", TEXT)
  public send_at:Date = null;

  @Column("created_at", TEXT)
  public created_at:Date = null;

  @Column("updated_at", TEXT)
  public updated_at:Date = null;

  public user:User = null;

  public answers:Answer[] = [];

  public recipients:Recipient[] = [];

  @Column("group_ids", TEXT)
  public group_ids:string = null;
  public groups:Group[] = [];

  @Column("user_ids", TEXT)
  public user_ids:string = null;
  public users:User[] = [];

  public replies:Reply[] = [];

  public reply:Reply = null;

  public schedule:Schedule = null;

  public answerReplies(answer:Answer):Reply[] {
    if (this.replies && this.replies.length > 0) {
      return this.replies.filter(reply => reply.answer == answer.answer);
    }
    return [];
  }

  public otherReplies():Reply[] {
    if (!this.replies || !this.replies.length) {
      return [];
    }
    let otherReplies = [];
    for (let reply of this.replies) {
      let otherAnswer = true;
      for (let answer of this.answers) {
        if (reply.answer === answer.answer) {
          otherAnswer = false;
        }
      }
      if (otherAnswer) {
        otherReplies.push(reply);
      }
    }
    return otherReplies;
  }

  public recipientsPending():Recipient[] {
    let _recipients = [];
    for (let recipient of this.recipients) {
      if (this.replies == null || this.replies.length == 0) {
        _recipients.push(recipient);
      }
      else if (this.replies.filter(reply => reply.user_id == recipient.user_id).length == 0) {
        _recipients.push(recipient);
      }
    }
    return _recipients;
  }

  public canRespond(person:Person):boolean {
    if (this.answers && this.answers.length == 0) {
      return false;
    }
    if (person && this.recipients.filter(recipient => recipient.user_id == person.id).length > 0) {
      for (let reply of this.replies) {
        if (person.id == reply.user_id) {
          return false;
        }
      }
      return this.replied == null || this.replied == false;
    }
    return false;
  }

  public canSend():boolean {
    if (this.send_via == null || this.send_via.length == 0) {
      return false;
    }
    return (this.recipients && this.recipients.length > 0) || (this.groups && this.groups.length > 0);
  }

  public canResend(person:Person):boolean {
    if (person == null) {
      return false;
    }
    if (person.id == this.user_id || person.isOwnerOrAdmin()) {
      if (this.replies == null || this.replies.length == 0 || this.replies.length < this.recipients.length) {
        return this.sent != false;
      }
    }
    return false;
  }

  public canDelete(person:Person):boolean {
    if (person == null) {
      return false;
    }
    if (person.id == this.user_id || person.isOwnerOrAdmin()) {
      return this.sent == null || this.sent == false;
    }
    return false;
  }

  public groupIds():number[] {
    let ids = [];
    if (this.groups && this.groups.length > 0) {
      for (let group of this.groups) {
        ids.push({id: group.id});
      }
    }
    return ids;
  }

  public recipientIds():number[] {
    return this.getRecipients().map(r => r.user_id ? r.user_id : r.id);
  }

  public sendVia() {
    if (Array.isArray(this.send_via)) {
      return this.send_via;
    }
    if (typeof this.send_via === 'string') {
      return this.send_via.split(",");
    }
    return [];
  }

  public hasBlankAnswers():boolean {
    for (let answer of this.answers) {
      if (answer.answer == null || answer.answer.length == 0) {
        return true;
      }
    }
    return false;
  }

  public hasDuplicateAnswers():boolean {
    for (let index1 in this.answers) {
      for (let index2 in this.answers) {
        if (index1 != index2) {
          let answer1 = this.answers[index1];
          let answer2 = this.answers[index2];
          if (answer1.answer.toLowerCase() === answer2.answer.toLowerCase()) {
            return true;
          }
        }
      }
    }
    return false;
  }

  public fillRecipientsSendVia():void {
    let checkin_send_via = this.sendVia();
    for (let recipient of this.recipients) {
      let recipient_send_via = [];
      for (let contact of recipient.contacts) {
        if (contact.blocked) {
          continue;
        }
        if (contact.type === 'phone' && checkin_send_via.indexOf('sms') > -1) {
          recipient_send_via.push('sms');
        }
        if (contact.type === 'phone' && checkin_send_via.indexOf('voice') > -1) {
          recipient_send_via.push('voice');
        }
        if (contact.type === 'email' && checkin_send_via.indexOf('email') > -1) {
          recipient_send_via.push('email');
        }
      }
      if (checkin_send_via.indexOf('app') > -1) {
        recipient_send_via.push('app');
      }
      recipient.send_via = recipient_send_via.join(',');
    }
  }

  private getRecipients():Recipient[] {
    let _recipients = {};
    for (let recipient of this.users) {
      _recipients[recipient.id] = recipient;
    }
    for (let group of this.groups) {
      for (let recipient of group.members) {
        _recipients[recipient.id] = recipient;
        _recipients[recipient.id].user_id = recipient.id;
      }
    }
    return Object.keys(_recipients).map((key) => { return <Recipient>_recipients[key]; });
  }

  public creditsRequired():number {
    let creditsRequired = 0;
    let checkinSendVia = this.sendVia();
    let _recipients = this.getRecipients();
    for (let recipient of _recipients) {
      if (!recipient.contacts || !recipient.contacts.length) {
        continue;
      }
      for (let contact of recipient.contacts) {
        if (contact.blocked) {
          continue;
        }
        if (contact.type === 'phone' && checkinSendVia.indexOf('sms') > -1) {
          creditsRequired++;
        }
        if (contact.type === 'phone' && checkinSendVia.indexOf('voice') > -1) {
          creditsRequired++;
        }
      }
    }
    return creditsRequired;
  }

  public sendTo():string {
    let send_to = [];
    if (this.everyone) {
      send_to.push('everyone');
    } else {
      if (this.groups) {
        if (this.groups.length == 1) {
          send_to.push('1 group');
        } else if (this.groups.length > 1) {
          send_to.push(this.groups.length + ' groups');
        }
      }
      if (this.users) {
        if (this.users.length == 1) {
          send_to.push('1 person');
        } else if (this.users.length > 1) {
          send_to.push(this.users.length + ' people');
        }
      }
    }
    if (send_to.length == 0) {
      send_to.push('nobody');
    }
    return send_to.join(' and ');
  }
}
