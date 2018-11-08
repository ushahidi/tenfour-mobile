import { Component, Input } from '@angular/core';

import { Checkin } from '../../models/checkin';
import { Answer } from '../../models/answer';
import { Person } from '../../models/person';
import { Reply } from '../../models/reply';

@Component({
  selector: 'checkin-badges',
  templateUrl: 'checkin-badges.html'
})
export class CheckinBadgesComponent {

  @Input()
  checkin:Checkin = null;

  RESPONSE_NONE:string = "No Response";
  RESPONSE_NONE_COLOR:string = "#CCCCCC";

  RESPONSE_OTHER:string = "Other Response";
  RESPONSE_OTHER_COLOR:string = "#777777";

  constructor() {}

  protected getBadges():any {
    let _badges = [];
    if (this.checkin) {
      if (this.checkin.answers) {
        for (let answer of this.checkin.answers) {
          if (this.checkin.waiting_count > 0) {
            _badges.push({
              color: answer.color,
              number: answer.replies || 0,
              text: answer.answer,
              answer: answer
            });
          }
          else if (answer.replies > 0) {
            _badges.push({
              color: answer.color,
              number: answer.replies || 0,
              text: answer.answer,
              answer: answer
            });
          }
        }
      }
      if (this.checkin.otherReplies().length > 0) {
        _badges.push({
          text: this.RESPONSE_OTHER,
          color: this.RESPONSE_OTHER_COLOR,
          number: this.checkin.otherReplies().length || 0
        });
      }
      if (this.checkin.waiting_count > 0) {
        _badges.push({
          text: this.RESPONSE_NONE,
          color: this.RESPONSE_NONE_COLOR,
          number: this.checkin.waiting_count || 0
        });
      }
      let zeros = 0;
      let values = 0;
      let width = 60;
      let responses = 0;
      for (let badge of _badges) {
        if (badge.number == 0) {
          zeros = zeros + 1;
        }
        else {
          values = values + 1;
        }
        responses = responses + badge.number;
      }
      for (let badge of _badges) {
        if (badge.number == 0) {
          badge.width = `${width}px`;
        }
        else {
          let percentage = (badge.number / responses * 100);
          let pixels = values > 0 ? zeros*(width/values) : zeros*width;
          badge.width = `calc(${percentage}% - ${pixels}px)`;
        }
      }
    }
    return _badges;
  }

}
