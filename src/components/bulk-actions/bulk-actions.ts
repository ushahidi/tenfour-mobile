import { Component, Input } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

import { Person } from '../../models/person';

@Component({
  selector: 'bulk-actions',
  templateUrl: 'bulk-actions.html'
})
export class BulkActionsComponent {

  @Input()
  people:Person[] = null;

  constructor(
    private params:NavParams,
    private viewController:ViewController) {
  }

  ngOnInit() {
    this.people = this.params.get('people');
  }

}
