import { Component } from '@angular/core';

@Component({
  selector: 'person-avatar',
  templateUrl: 'person-avatar.html',
  inputs: ['initials', 'image', 'large']
})
export class PersonAvatarComponent {

  image: string;
  initials: string;
  color: string = "#000000";
  large:boolean = false;

  constructor() {
  }

  ngOnInit() {

  }

}
