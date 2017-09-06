import { Component, Input, ElementRef } from '@angular/core';
import { style, state, animate, transition, trigger } from '@angular/animations';

@Component({
  selector: 'person-avatar',
  templateUrl: 'person-avatar.html',
  animations: [
    trigger('fadeInOut', [
      state('1', style({ opacity: 1 })),
      state('0', style({ opacity: 0 })),
      transition('0 => 1', animate('900ms ease-in')),
      transition('1 => 0', animate('300ms ease-out'))
    ])
  ]
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

  fadeIn:boolean = false;

  hasImage:boolean = false;

  constructor(private elementRef:ElementRef) {
  }

  ngOnInit() {
    this.fadeIn = false;
  }

  ngAfterContentInit() {
    this.fadeIn = this.image && this.image.length > 0;
  }

  ngOnChanges() {
    this.hasImage = this.image != null && this.image.length > 0 && (this.image.startsWith("http") || this.image.startsWith("data:image"));
  }

}
