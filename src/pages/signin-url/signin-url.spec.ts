import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, NgModule } from '@angular/core';
import { IonicModule, Platform, NavController} from 'ionic-angular/index';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import {} from 'jasmine';

import { SigninUrlPage } from './signin-url';
import { SigninUrlModule } from './signin-url.module';

import { SignupEmailModule } from '../../pages/signup-email/signup-email.module';

import { ApiProvider } from '../../providers/api/api';

// describe('SigninUrl', () => {
//   let component: SigninUrlPage;
//   let fixture: ComponentFixture<SigninUrlPage>;
//
//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [
//       ],
//       imports: [
//         SigninUrlModule,
//         SigninEmailModule,
//         SignupEmailModule,
//         IonicModule.forRoot(SigninUrlPage)
//       ],
//       providers: [
//         NavController,
//         ApiProvider
//       ],
//       schemas: [ NO_ERRORS_SCHEMA ]
//     });
//   }));
//
//   beforeEach(() => {
//     fixture = TestBed.createComponent(SigninUrlPage);
//     component = fixture.componentInstance;
//   });
//
//   afterEach(() => {
//     fixture = null;
//     component = null;
//   });
//
//   it('should create component', () => expect(component).toBeDefined());
//
// });
