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
      let minWidth = 50;
      let cardWidth = document.querySelectorAll(".card")[0].clientWidth;
      let minPercentage = cardWidth / minWidth;
      let totalNumber = badges.reduce((total, badge) => total + badge.number, 0);
      let fixedBadges = badges.filter((badge) => (badge.number / totalNumber * 100) < minPercentage);
      let dynamicBadges = badges.filter((badge) => (badge.number / totalNumber * 100) >= minPercentage);
      for (let badge of fixedBadges) {
        badge.width = `${minWidth}px`;
      }
      for (let badge of dynamicBadges) {
        let percentage = (badge.number / totalNumber * 100);
        if (fixedBadges.length > 0) {
          let pixels = fixedBadges.length*(minWidth/dynamicBadges.length);
          if (pixels < cardWidth) {
            badge.width = `calc(${percentage}% - ${pixels}px)`;
          }
          else {
            badge.width = `${percentage}%`;
          }
        }
        else {
          badge.width = `${percentage}%`;
        }
      }
    }
    return badges;
  }

}
