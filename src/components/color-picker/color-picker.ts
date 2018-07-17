import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'color-picker',
  templateUrl: 'color-picker.html'
})
export class ColorPickerComponent {

  colors = [
    "#00AF64", "#FFC900", "#F381A1", "#1D8DD8",
    "#F7921E", "#C65DBC", "#52BFCD", "#30B7A4",
    "#AE94E0", "#ACE0F1", "#BFE254", "#3C4DA5",
    "#DA1C5C", "#F15A29", "#603795", "#016B3E"];

  constructor(
    private params:NavParams,
    private viewController: ViewController) {
  }

  selectColor(color:string) {
    this.params.get('on_changed')(color);
    this.viewController.dismiss();
  }

}
