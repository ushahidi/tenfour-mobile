import { Component, Input } from '@angular/core';

import { Checkin } from '../../models/checkin';
import { Answer } from '../../models/answer';

@Component({
  selector: 'checkin-badges',
  templateUrl: 'checkin-badges.html'
})
export class CheckinBadgesComponent {

  @Input()
  checkin:Checkin = null;

  constructor() {
  }

  protected gridAnswers():Answer[] {
    let _answers = [];
    if (this.checkin && this.checkin.answers) {
      for (let answer of this.checkin.answers) {
        if (this.checkin.waiting_count > 0) {
          _answers.push(answer);
        }
        else if (answer.replies > 0) {
          _answers.push(answer);
        }
      }
    }
    return _answers;
  }

  protected gridColumns(answer:Answer):number {
    if (this.checkin) {
      if (this.checkin.waiting_count > 0) {
        let repliesCount = answer ? answer.replies + 1 : 0;
        let answersCount = this.checkin.answers ? this.checkin.answers.length : 0;
        let sentCount = this.checkin.replies ? this.checkin.replies.length : 0;
        let waitingCount = this.checkin.waiting_count;
        return Math.round((repliesCount / (answersCount + sentCount + waitingCount)) * 12);
      }
      else {
        let repliesCount = answer ? answer.replies + 1 : 0;
        let answersCount = this.checkin.answers.filter((answer) => answer.replies > 0).length;
        let sentCount = this.checkin.replies ? this.checkin.replies.length : 0;
        return Math.round((repliesCount / (answersCount + sentCount)) * 12);
      }
    }
    return 0;
  }

}
