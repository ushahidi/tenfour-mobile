import { Component, Input } from '@angular/core';

import { PopoverController } from 'ionic-angular';

import { Checkin } from '../../models/checkin';
import { Answer } from '../../models/answer';
import { Person } from '../../models/person';
import { Reply } from '../../models/reply';

import { CheckinPopoverComponent } from '../checkin-popover/checkin-popover';

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

  constructor(private popoverController:PopoverController) {}

  protected getBadges():any {
    let _badges = [];
    if (this.checkin) {
      if (this.checkin.answers) {
        for (let answer of this.checkin.answers) {
          if (this.checkin.waiting_count > 0) {
            _badges.push({
              columns: 1,
              color: answer.color,
              number: answer.replies || 0,
              text: answer.answer,
              answer: answer
            });
          }
          else if (answer.replies > 0) {
            _badges.push({
              columns: 1,
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
          columns: 1,
          text: this.RESPONSE_OTHER,
          color: this.RESPONSE_OTHER_COLOR,
          number: this.checkin.otherReplies().length || 0
        });
      }
      if (this.checkin.waiting_count > 0) {
        _badges.push({
          columns: 1,
          text: this.RESPONSE_NONE,
          color: this.RESPONSE_NONE_COLOR,
          number: this.checkin.waiting_count || 0
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

  private showPopover(event:any, badge:any) {
    let people = [];
    if (badge.answer) {
      people = this.getPeople(this.checkin.answerReplies(badge.answer))
    }
    else if (badge.text == this.RESPONSE_NONE) {
      people = this.checkin.recipientsPending();
    }
    else if (badge.text == this.RESPONSE_OTHER) {
      people = this.getPeople(this.checkin.otherReplies());
    }
    else {
      people = [];
    }
    let popover = this.popoverController.create(CheckinPopoverComponent, {
      title: badge.text,
      people: people
    }, {
      showBackdrop: true,
      enableBackdropDismiss: true
    });
    let ev = {
      target : {
        getBoundingClientRect : () => {
          return {
            top: event.clientY,
            left: event.clientX
          };
        }
      }
    };
    popover.present({
      ev: ev
    });
  }

  private getPeople(replies:Reply[]):Person[] {
    let people = [];
    for (let recipient of this.checkin.recipients) {
      for (let reply of replies) {
        if (recipient.user_id === reply.user_id) {
          people.push(recipient);
          continue;
        }
      }
    }
    return people;
  }

}
