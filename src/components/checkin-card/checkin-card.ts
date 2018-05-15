import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Person } from '../../models/person';
import { Checkin } from '../../models/checkin';

import { LoggerProvider } from '../../providers/logger/logger';

@Component({
  selector: 'checkin-card',
  templateUrl: 'checkin-card.html'
})
export class CheckinCardComponent {

  @Input()
  checkin:Checkin = null;

  @Input()
  person:Person = null;

  @Input()
  selected:boolean = false;

  @Output()
  cardSelected = new EventEmitter();

  @Output()
  sendSelected = new EventEmitter();

  @Output()
  resendSelected = new EventEmitter();

  hasCardSelected:boolean = false;
  hasSendSelected:boolean = false;
  hasResendSelected:boolean = false;

  constructor(private logger:LoggerProvider) {

  }

  ngOnInit() {
    this.hasCardSelected = this.cardSelected && this.cardSelected.observers.length > 0;
    this.hasSendSelected = this.sendSelected && this.sendSelected.observers.length > 0;
    this.hasResendSelected = this.resendSelected && this.resendSelected.observers.length > 0;
  }

  onCardSelected(event:any) {
    this.logger.info(this, "onCardSelected");
    this.cardSelected.emit();
  }

  onSendSelected(event:any) {
    this.logger.info(this, "onSendSelected");
    this.sendSelected.emit();
  }

  onResendSelected(event:any) {
    this.logger.info(this, "onResendSelected");
    this.resendSelected.emit();
  }

}
