import { Component, Input, Output, EventEmitter  } from '@angular/core';

import { User } from '../../models/user';
import { Checkin } from '../../models/checkin';

@Component({
  selector: 'checkin-details',
  templateUrl: 'checkin-details.html'
})
export class CheckinDetailsComponent {

  @Input()
  checkin:Checkin;

  @Input()
  user:User;

  @Input()
  canRespond:boolean = false;

  @Input()
  canResend:boolean = false;

  @Output()
  respondClicked = new EventEmitter();

  @Output()
  resendClicked = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
  }

  onRespondClicked(event:any) {
    this.respondClicked.emit();
  }

  onResendClicked(event:any) {
    this.resendClicked.emit();
  }

}
