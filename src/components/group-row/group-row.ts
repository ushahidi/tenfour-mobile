import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Group } from '../../models/group';
import { Person } from '../../models/person';

@Component({
  selector: 'group-row',
  templateUrl: 'group-row.html'
})
export class GroupRowComponent {

  @Input()
  group:Group;

  @Input()
  user:Person;

  @Input()
  selected:boolean = false;

  @Output()
  rowSelected = new EventEmitter();

  @Output()
  removeSelected = new EventEmitter();

  hasRowSelected:boolean = false;

  hasRemoveSelected:boolean = false;

  constructor() {
  }

  ngOnInit() {
    this.hasRowSelected = this.rowSelected && this.rowSelected.observers.length > 0;
    this.hasRemoveSelected = this.removeSelected && this.removeSelected.observers.length > 0;
  }

  onRowSelected(event:any) {
    this.rowSelected.emit();
  }

  onRemoveSelected(event:any) {
    this.removeSelected.emit();
  }

}
