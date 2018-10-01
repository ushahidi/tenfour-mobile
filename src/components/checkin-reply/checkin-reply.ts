import { Component, Input, Output, EventEmitter  } from '@angular/core';

import { Reply } from '../../models/reply';
import { Answer } from '../../models/answer';
import { User } from '../../models/user';

import { LoggerProvider } from '../../providers/logger/logger';

@Component({
  selector: 'checkin-reply',
  templateUrl: 'checkin-reply.html'
})
export class CheckinReplyComponent {

  @Input()
  reply:Reply;

  @Input()
  answer:Answer;

  @Input()
  user:User;

  @Output()
  replyClicked = new EventEmitter();

  constructor(private logger:LoggerProvider) {
  }

  onReplyClicked(event:any) {
    this.logger.info(this, "onReplyClicked");
    this.replyClicked.emit(this.reply);
  }
}
