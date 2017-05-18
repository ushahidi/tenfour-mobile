import { Component } from '@angular/core';

@Component({
  selector: 'person-avatar',
  templateUrl: 'person-avatar.html',
  inputs: ['initials', 'image', 'large']
})
export class PersonAvatarComponent {

  image: string;
  initials: string;
  large:boolean = false;

  constructor() {
  }
  
  ngOnInit() {
      
  }

}
