import { Table } from '../decorators/table';
import { Column } from '../decorators/column';

import { Model, TEXT, INTEGER, BOOLEAN, PRIMARY_KEY } from '../models/model';
import { Person } from '../models/person';
import { Checkin } from '../models/checkin';
import { Settings } from '../models/settings';
import { Group } from '../models/group';
import { Region } from '../models/region';
import { Country } from '../models/country';

@Table("organizations")
export class Organization extends Model {

  constructor(data:any=null) {
    super(data);
    this.copyInto(data);
    if (data) {
      if (data.user) {
        this.user_id = data.user.id;
      }
      if (data.settings) {
        this.settings = [];
        for (let _settings of data.settings) {
          if (_settings.key && _settings.values) {
            if (_settings.key == 'location') {
              this.location = _settings.values.name;
            }
            else if (_settings.key == 'organization_types') {
              this.types = _settings.values.join(",");
            }
            else if (_settings.key == 'organization_size') {
              this.size = _settings.values['size'];
            }
            else if (_settings.key == 'channels') {
              if (_settings.values.preferred) {
                this.preferred_enabled = _settings.values.preferred.enabled;
              }
              else {
                this.preferred_enabled = null;
              }
              if (_settings.values.app) {
                this.app_enabled = _settings.values.app.enabled;
              }
              else {
                this.app_enabled = null;
              }
              if (_settings.values.email) {
                this.email_enabled = _settings.values.email.enabled;
              }
              else {
                this.email_enabled = null;
              }
              if (_settings.values.sms) {
                this.sms_enabled = _settings.values.sms.enabled;
              }
              else {
                this.sms_enabled = null;
              }
              if (_settings.values.voice) {
                this.voice_enabled = _settings.values.voice.enabled;
              }
              else {
                this.voice_enabled = null;
              }
              if (_settings.values.twitter) {
                this.twitter_enabled = _settings.values.twitter.enabled;
              }
              else {
                this.twitter_enabled = null;
              }
              if (_settings.values.slack) {
                this.slack_enabled = _settings.values.slack.enabled;
                if (_settings.values.slack.webhook_url) {
                  this.slack_webhook = _settings.values.slack.webhook_url;
                }
                else {
                  this.slack_webhook = null;
                }
              }
              else {
                this.slack_enabled = null;
              }
            }
            else if (_settings.key == 'plan_and_credits') {
              this.credits_extra = parseInt(_settings.values.monthlyCreditsExtra);
            }
            else if (_settings.key == 'ldap') {
              this.ldap_settings = JSON.stringify(_settings.values);
            }
          }
          let settings = new Settings(_settings);
          settings.organization_id = this.id;
          this.settings.push(settings);
        }
      }
    }
  }

  public newInstance<Organization>(data:any=null):any {
    return new Organization(data);
  }

  @Column("id", INTEGER, PRIMARY_KEY)
  public id:number = null;

  @Column("name", TEXT)
  public name:string = null;

  @Column("subdomain", TEXT)
  public subdomain:string = null;

  @Column("profile_picture", TEXT)
  public profile_picture:string = null;

  @Column("email", TEXT)
  public email:string = null;

  @Column("user_id", INTEGER)
  public user_id:number = null;

  @Column("user_name", TEXT)
  public user_name:string = null;

  @Column("uri", TEXT)
  public uri:string = null;

  @Column("types", TEXT)
  public types:string = null;

  @Column("regions", TEXT)
  public regions:string = null;

  @Column("codes", TEXT)
  public codes:string = null;

  @Column("size", TEXT)
  public size:string = null;

  @Column("location", TEXT)
  public location:string = null;

  @Column("app_enabled", BOOLEAN)
  public app_enabled:boolean = null;

  @Column("email_enabled", BOOLEAN)
  public email_enabled:boolean = null;

  @Column("sms_enabled", BOOLEAN)
  public sms_enabled:boolean = null;

  @Column("voice_enabled", BOOLEAN)
  public voice_enabled:boolean = null;

  @Column("twitter_enabled", BOOLEAN)
  public twitter_enabled:boolean = null;

  @Column("slack_enabled", BOOLEAN)
  public slack_enabled:boolean = null;

  @Column("slack_webhook", TEXT)
  public slack_webhook:string = null;

  @Column("preferred_enabled", BOOLEAN)
  public preferred_enabled:boolean = null;

  @Column("credits", INTEGER)
  public credits:number = null;

  @Column("credits_extra", INTEGER)
  public credits_extra:number = null;

  @Column("subscription_status", TEXT)
  public subscription_status:string = null;

  @Column("subscription_plan", TEXT)
  public subscription_plan:string = null;

  @Column("user_count", INTEGER)
  public user_count:number = null;

  @Column("created_at", TEXT)
  public created_at:Date = null;

  @Column("updated_at", TEXT)
  public updated_at:Date = null;

  @Column("ldap_settings", TEXT)
  public ldap_settings:string = null;

  public settings:Settings[] = [];

  public people:Person[] = [];

  public checkins:Checkin[] = [];

  public groups:Group[] = [];

  public countries:Country[] = [];

  public countryRegions():string[] {
    if (this.regions) {
      return this.regions.split(",");
    }
    return [];
  }

  public countryCodes():string[] {
    if (this.codes) {
      return this.codes.split(",");
    }
    return [];
  }

  public hasFreePlan():boolean {
    return (this.subscription_plan === 'free-plan');
  }

  public hasProPlan():boolean {
    return (this.subscription_plan === 'pro-plan');
  }

}
