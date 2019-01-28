import { Component, OnInit } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'send-via',
  templateUrl: 'send-via.html'
})
export class SendViaComponent implements OnInit {

  send_via:string="";

  email_enabled:boolean=false;
  email_selected:boolean=false;

  sms_enabled:boolean=false;
  sms_selected:boolean=false;

  slack_enabled:boolean=false;
  slack_selected:boolean=false;

  app_enabled:boolean=false;
  app_selected:boolean=false;

  voice_enabled:boolean=false;
  voice_selected:boolean=false;

  constructor(
    private params:NavParams,
    private viewController:ViewController) {
  }

  ngOnInit() {
    this.send_via = this.params.get('send_via');
    this.email_enabled = this.params.get('email_enabled');
    this.sms_enabled = this.params.get('sms_enabled');
    this.slack_enabled = this.params.get('slack_enabled');
    this.app_enabled = this.params.get('app_enabled');
    this.voice_enabled = this.params.get('voice_enabled');
    if (this.send_via && this.send_via.length > 0) {
      let values = this.send_via.split(",");
      this.email_selected = values.indexOf('email') != -1;
      this.sms_selected = values.indexOf('sms') != -1;
      this.slack_selected = values.indexOf('slack') != -1;
      this.app_selected = values.indexOf('app') != -1;
      this.voice_selected = values.indexOf('voice') != -1;
    }
  }

  onAppSelected(event:any) {
    this.onChanged();
  }

  onEmailChanged(event:any) {
    this.onChanged();
  }

  onSmsChanged(event:any) {
    this.onChanged();
  }

  onSlackChanged(event:any) {
    this.onChanged();
  }

  onVoiceChanged(event:any) {
    this.onChanged();
  }

  onChanged() {
    let send_via = [];
    if (this.email_enabled && this.email_selected) {
      send_via.push('email');
    }
    if (this.sms_enabled && this.sms_selected) {
      send_via.push('sms');
    }
    if (this.slack_enabled && this.slack_selected) {
      send_via.push('slack');
    }
    if (this.app_selected) {
      send_via.push('app');
    }
    if (this.voice_enabled && this.voice_selected) {
      send_via.push('voice');
    }
    this.params.get('on_changed')(send_via.join(','));
  }

}
