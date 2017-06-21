import { Component, Input, ElementRef } from '@angular/core';

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

  @Input()
  scrollTarget:any = null;

  offset:number = 0;

  errorImage:string = 'assets/images/user.jpg';

  defaultImage:string = 'assets/images/user.jpg';

  constructor(private elementRef:ElementRef) {
  }

  ngOnInit() {

  }

}
