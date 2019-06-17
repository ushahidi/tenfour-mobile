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
    let badges = [];
    if (this.checkin) {
      if (this.checkin.answers) {
        for (let answer of this.checkin.answers) {
          if (this.checkin.waiting_count > 0) {
            badges.push({
              color: answer.color,
              number: answer.replies || 0,
              text: answer.answer,
              answer: answer
            });
          }
          else if (answer.replies > 0) {
            badges.push({
              color: answer.color,
              number: answer.replies || 0,
              text: answer.answer,
              answer: answer
            });
          }
        }
      }
      if (this.checkin.otherReplies().length > 0) {
        badges.push({
          text: this.RESPONSE_OTHER,
          color: this.RESPONSE_OTHER_COLOR,
          number: this.checkin.otherReplies().length || 0
        });
      }
      if (this.checkin.waiting_count > 0) {
        badges.push({
          text: this.RESPONSE_NONE,
          color: this.RESPONSE_NONE_COLOR,
          number: this.checkin.waiting_count || 0
        });
      }
      let width = 50;
      let mininum = 10;
      let total = badges.reduce((total, badge) => total + badge.number, 0);
      let defaults = badges.filter((badge) => (badge.number / total * 100) < mininum);
      let percentages = badges.filter((badge) => (badge.number / total * 100) >= mininum);
      for (let badge of defaults) {
        badge.width = `${width}px`;
      }
      let cardWidth = document.querySelectorAll(".card")[0].clientWidth;
      let divisor = percentages.reduce((total, badge) => total + badge.number, 0);
      for (let badge of percentages) {
        let percentage = (badge.number / divisor * 100);
        let pixels = defaults.length > 0 ? defaults.length*(width/percentages.length) : defaults.length*width;
        badge.minWidth = `${width}px`;
        if (cardWidth < pixels) {
          badge.width = (badge.number / total * 100) + "%";
        }
        else {
          badge.width = `calc(${percentage}% - ${pixels}px)`;
        }
      }
    }
    return badges;
  }

}
