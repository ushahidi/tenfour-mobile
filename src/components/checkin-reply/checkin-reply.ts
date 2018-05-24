import { Component, Input, Output, EventEmitter  } from '@angular/core';

import { Reply } from '../../models/reply';
import { Answer } from '../../models/answer';
import { User } from '../../models/user';

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

  constructor() {
  }

}
