import { Component, Input, Output, EventEmitter  } from '@angular/core';

import { User } from '../../models/user';
import { Checkin } from '../../models/checkin';
import { Reply } from '../../models/reply';
import { Recipient } from '../../models/recipient';

@Component({
  selector: 'checkin-details',
  templateUrl: 'checkin-details.html'
})
export class CheckinDetailsComponent {

  filter:String = '';
  ENABLE_FILTER_AFTER_RECIPIENT_COUNT:number = 10;

  @Input()
  checkin:Checkin;

  @Input()
  user:User;

  @Input()
  canRespond:boolean = false;

  @Input()
  canResend:boolean = false;

  @Output()
  respondClicked = new EventEmitter();

  @Output()
  resendClicked = new EventEmitter();

  @Output()
  replyClicked = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
  }

  onRespondClicked(event:any) {
    this.respondClicked.emit();
  }

  onResendClicked(event:any) {
    this.resendClicked.emit();
  }

  onReplyClicked(reply:Reply, event:any) {
    this.replyClicked.emit(reply);
  }

  private isRecipientFiltered(name:string) {
    if (!this.filter || this.filter === '') {
      return false;
    }

    if (!name) {
      return false;
    }

    return name.toLowerCase().indexOf(this.filter.toLowerCase()) == -1;
  }
}
