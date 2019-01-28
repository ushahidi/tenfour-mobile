import { Injectable } from '@angular/core';

import { Contacts } from '@ionic-native/contacts';

import { LoggerProvider } from '../../providers/logger/logger';

@Injectable()
export class ContactsProvider {

  constructor(
    private contacts:Contacts,
    private logger:LoggerProvider) {
  }

  public loadContacts():Promise<any> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadContacts");
      let options = {
        filter : "",
        multiple:true,
        desiredFields: [
          'name',
          'displayName',
          'phoneNumbers',
          'emails',
          'addresses',
          'organizations']
      };
      this.contacts.find(['*'], options).then((contacts:any[]) => {
        let sorted = contacts.sort((a, b) => {
          let givenA = a.name.givenName;
          let givenB = b.name.givenName;
          let familyA = a.name.familyName;
          let familyB = b.name.familyName;
          let formattedA = a.name.formatted;
          let formattedB = b.name.formatted;
          if (familyA < familyB) return -1;
          if (familyA > familyB) return 1;
          if (givenA < givenB) return -1;
          if (givenA > givenB) return 1;
          if (formattedA < formattedB) return -1;
          if (formattedA > formattedB) return -1;
          return 0;
        });
        resolve(sorted);
      },
      (error:any) => {
        reject(error);
      });
    });
  }

}
