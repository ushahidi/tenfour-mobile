import { Component, Input } from '@angular/core';

@Component({
  selector: 'person-avatar',
  templateUrl: 'person-avatar.html'
})
export class PersonAvatarComponent {

  @Input()
  image:string = null;

  @Input()
  initials:string = null;

  @Input()
  color:string = null;

  @Input()
  large:boolean = false;

  constructor() {
  }

  ngOnInit() {

  }

}
