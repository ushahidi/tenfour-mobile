
export interface Token {

  token_type:string;

  access_token:string;

  refresh_token:string;

  expires_in:number;

  issued_at:Date;

  expires_at:Date;

}
