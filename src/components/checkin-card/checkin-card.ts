import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { User } from '../../models/user';
import { Checkin } from '../../models/checkin';
import { Schedule } from '../../models/schedule';

import { LoggerProvider } from '../../providers/logger/logger';

@Component({
  selector: 'checkin-card',
  templateUrl: 'checkin-card.html'
})
export class CheckinCardComponent implements OnInit {

  @Input()
  checkin:Checkin = null;

  @Input()
  user:User = null;

  @Input()
  selected:boolean = false;

  @Output()
  cardSelected = new EventEmitter();

  @Output()
  sendSelected = new EventEmitter();

  @Output()
  resendSelected = new EventEmitter();

  @Output()
  deleteSelected = new EventEmitter();

  hasCardSelected:boolean = false;
  hasSendSelected:boolean = false;
  hasResendSelected:boolean = false;
  hasDeleteSelected:boolean = false;

  constructor(private logger:LoggerProvider) {

  }

  ngOnInit() {
    this.hasCardSelected = this.cardSelected && this.cardSelected.observers.length > 0;
    this.hasSendSelected = this.sendSelected && this.sendSelected.observers.length > 0;
    this.hasResendSelected = this.resendSelected && this.resendSelected.observers.length > 0;
    this.hasDeleteSelected = this.deleteSelected && this.deleteSelected.observers.length > 0;
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

  onDeleteSelected(event:any) {
    this.logger.info(this, "onDeleteSelected");
    this.deleteSelected.emit();
  }

}
