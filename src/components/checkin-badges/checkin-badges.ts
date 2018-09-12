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

  protected badges():any {
    let _badges = [];
    if (this.checkin) {
      if (this.checkin.answers) {
        for (let answer of this.checkin.answers) {
          if (this.checkin.waiting_count > 0) {
            _badges.push({
              color: answer.color,
              number: answer.replies || 0,
              columns: 1,
              text: answer.answer
            });
          }
          else if (answer.replies > 0) {
            _badges.push({
              color: answer.color,
              number: answer.replies || 0,
              columns: 1,
              text: answer.answer
            });
          }
        }
      }
      if (this.checkin.otherReplies().length > 0) {
        _badges.push({
          color: "#777777",
          number: this.checkin.otherReplies().length || 0,
          columns: 1,
          text: "Other Response"
        });
      }
      if (this.checkin.waiting_count > 0) {
        _badges.push({
          color: "#CCCCCC",
          number: this.checkin.waiting_count || 0,
          columns: 1,
          text: "No Response"
        });
      }
      let total = 0;
      for (let badge of _badges) {
        total = total + badge.number + 1;
      }
      for (let badge of _badges) {
        badge.columns = Math.round(((badge.number + 1) / total) * 12);
      }
    }
    return _badges;
  }

}
