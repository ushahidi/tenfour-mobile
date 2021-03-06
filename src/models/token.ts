
export interface Token {

  username:string;

  organization:string;

  subdomain:string;

  token_type:string;

  access_token:string;

  refresh_token:string;

  expires_in:number;

  issued_at:Date;

  expires_at:Date;

}
