import { Component, Input, ElementRef } from '@angular/core';

import { Person } from '../../models/person';

@Component({
  selector: 'multi-avatar',
  templateUrl: 'multi-avatar.html'
})
export class MultiAvatarComponent {

  @Input()
  people:Person[] = null;

  maxAvatars:number = 3;

  constructor(private elementRef:ElementRef) {
  }

}
