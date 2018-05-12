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

  constructor(private logger:LoggerProvider) {

  }

  ngOnInit() {
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
