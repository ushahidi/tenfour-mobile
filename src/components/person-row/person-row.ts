import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { Person } from '../../models/person';

@Component({
  selector: 'person-row',
  templateUrl: 'person-row.html'
})
export class PersonRowComponent implements OnInit {

  @Input()
  person:Person;

  @Input()
  user:Person;

  @Input()
  selectable:boolean = false;

  @Output()
  rowSelected = new EventEmitter();

  @Output()
  removeSelected = new EventEmitter();

  @Output()
  rowClicked = new EventEmitter();

  hasRowSelected:boolean = false;
  hasRemoveSelected:boolean = false;

  dots:string = "assets/images/logo-dots.png";

  constructor() {
  }

  ngOnInit() {
    this.hasRowSelected = this.rowSelected && this.rowSelected.observers.length > 0;
    this.hasRemoveSelected = this.removeSelected && this.removeSelected.observers.length > 0;
  }

  onRowSelected(event:any) {
    this.rowSelected.emit();
  }

  get isSelectable() {
    return !this.person.isExternal() && this.selectable;
  }

  onRemoveSelected(event:any) {
    this.removeSelected.emit();
  }

  onRowClicked(event:any) {
    console.log('onRowClicked');
    this.rowClicked.emit();
  }

}
