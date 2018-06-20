import { Component, Input } from '@angular/core';

@Component({
  selector: 'organization-logo',
  templateUrl: 'organization-logo.html'
})
export class OrganizationLogoComponent {

  @Input()
  image:string = null;

  logo:string = "assets/images/dots.png";

  constructor() {

  }

}
