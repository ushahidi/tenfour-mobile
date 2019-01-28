import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SendViaComponent } from './send-via';

@NgModule({
  declarations: [
    SendViaComponent
  ],
  imports: [
    IonicPageModule.forChild(SendViaComponent)
  ],
  exports: [
    SendViaComponent
  ]
})
export class SendViaModule {}
