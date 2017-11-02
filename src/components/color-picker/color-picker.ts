import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'color-picker',
  templateUrl: 'color-picker.html'
})
export class ColorPickerComponent {

  colors = [
    "#5BAA61", "#E7C24D", "#BA6A6B", "#2875B1",
    "#DE7E2D", "#B63DC1", "#52BFCD", "#0F7E70",
    "#A28AD9", "#19AEE9", "#0273A3", "#304170",
    "#99238C", "#C7470D", "#793EE8", "#1E9545"];

  constructor(
    private params:NavParams,
    private viewController: ViewController) {
  }

  selectColor(color:string) {
    console.log(`selectColor ${color}`);
    this.params.get('on_changed')(color);
    this.viewController.dismiss();
  }

}
