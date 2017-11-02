import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ColorPickerComponent } from './color-picker';

@NgModule({
  declarations: [
    ColorPickerComponent,
  ],
  imports: [
    IonicPageModule.forChild(ColorPickerComponent),
  ],
  exports: [
    ColorPickerComponent
  ]
})
export class ColorPickerModule {}
