import { Component, Input, Output, EventEmitter  } from '@angular/core';

import { Person } from '../../models/person';
import { Checkin } from '../../models/checkin';

@Component({
  selector: 'checkin-details',
  templateUrl: 'checkin-details.html'
})
export class CheckinDetailsComponent {

  @Input()
  checkin:Checkin;

  @Input()
  person:Person;

  @Input()
  canSend:boolean = false;

  @Input()
  canResend:boolean = false;

  @Output()
  sendClicked = new EventEmitter();

  @Output()
  resendClicked = new EventEmitter();

  hasSendClicked:boolean = false;
  hasResendClicked:boolean = false;

  constructor() {
  }

  ngOnInit() {
    this.hasSendClicked = this.sendClicked && this.sendClicked.observers.length > 0;
    this.hasResendClicked = this.resendClicked && this.resendClicked.observers.length > 0;
  }

  onSendClicked(event:any) {
    this.sendClicked.emit();
  }

  onResendClicked(event:any) {
    this.resendClicked.emit();
  }

}
