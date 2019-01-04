import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { Group } from '../../models/group';
import { Person } from '../../models/person';

@Component({
  selector: 'group-row',
  templateUrl: 'group-row.html'
})
export class GroupRowComponent implements OnInit {

  @Input()
  group:Group;

  @Input()
  user:Person;

  @Input()
  selectable:boolean = false;

  @Output()
  rowSelected = new EventEmitter();

  @Output()
  rowClicked = new EventEmitter();

  hasRowSelected:boolean = false;

  hasRemoveSelected:boolean = false;

  constructor() {
  }

  ngOnInit() {
    this.hasRowSelected = this.rowSelected && this.rowSelected.observers.length > 0;
  }

  onRowClicked(event:any) {
    this.rowClicked.emit();
  }

  onRowSelected(event:any) {
    this.rowSelected.emit();
  }

  get isSelectable() {
    return this.selectable && !this.group.isExternal();
  }

}
