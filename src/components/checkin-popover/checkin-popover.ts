import { Component, Input, OnInit } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

import { Person } from '../../models/person';

@Component({
  selector: 'checkin-popover',
  templateUrl: 'checkin-popover.html'
})
export class CheckinPopoverComponent implements OnInit {

  @Input()
  title:string = null;

  @Input()
  people:Person[] = null;

  constructor(
    private params:NavParams,
    private viewController:ViewController) {
  }

  ngOnInit() {
    this.title = this.params.get('title');
    this.people = this.params.get('people');
  }

}
