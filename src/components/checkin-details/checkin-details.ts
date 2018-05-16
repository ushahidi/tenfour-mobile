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
  canRespond:boolean = false;

  @Input()
  canResend:boolean = false;

  @Output()
  respondClicked = new EventEmitter();

  @Output()
  resendClicked = new EventEmitter();

  hasRespondClicked:boolean = false;
  hasResendClicked:boolean = false;

  constructor() {
  }

  ngOnInit() {
    this.hasRespondClicked = this.respondClicked && this.respondClicked.observers.length > 0;
    this.hasResendClicked = this.resendClicked && this.resendClicked.observers.length > 0;
  }

  onRespondClicked(event:any) {
    this.respondClicked.emit();
  }

  onResendClicked(event:any) {
    this.resendClicked.emit();
  }

}
