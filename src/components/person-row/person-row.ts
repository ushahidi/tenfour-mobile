import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Person } from '../../models/person';

@Component({
  selector: 'person-row',
  templateUrl: 'person-row.html'
})
export class PersonRowComponent {

  @Input()
  person:Person;

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