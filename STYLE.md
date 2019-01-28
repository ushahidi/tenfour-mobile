# Ushahidi
## TenFour
### Style Guide

---

- [General](#general)
- [Formatting](#formatting)
- [Logging](#logging)
- [Comments](#comments)
- [Methods](#methods)
- [Styling](#styling)
- [Pages](#pages)
- [Providers](#providers)
- [Models](#models)
- [Constants](#constants)
- [Environments](#environments)
- [Self Documenting](#self-documenting)
- [Variables](#variables)
- [Arrays](#arrays)
- [Strings](#strings)
- [Functions](#functions)
- [Properties](#properties)
- [Blocks](#blocks)
- [Whitespace](#whitespace)

#### General
- keep things DRY (don't repeat yourself)
- follow the KISS (keep it simple) principle
- follow existing code patterns and conventions

#### Formatting
- use consistent line indentation
- leave one blank line between methods
- avoid multiple new lines inside of methods

#### Logging
- use `this.logger.info` for general debug information
- use `this.logger.warn` for more important information
- use `this.logger.error` when an error or exception has occurred
- note, all logging is excluded from production builds to avoid security risks

#### Comments
- never commit any commented-out code to the repo
- out of date comments that don't match the code can cause confusion and be misleading
- avoid excessive comments in favor of [self-documenting code](https://www.sitepoint.com/self-documenting-javascript/)

#### Methods
- use strongly type method parameters, ex `getOrganization(user:User, id:number, users:boolean=false)`
- use optional params when needed, ex `showPopover(event:any=null)`
- include the return type in method definitions, ex `userLogout(user:User):Promise<boolean>`
- make use of BasePage helper methods when possible, ex `this.getParameter<User>("user")`
- try to logically group similar methods together so easy to find related methods
- avoid using empty returns in favor of explicit if-else statements, a missed `return` could wreak havok
```
// bad
if (!conditionOne) {
  return;
}
if (!conditionTwo) {
  //return;
}
somethingAccidental();

// good
if (!conditionOne) {

}
else if (!conditionTwo) {

}
else {
  somethingIntentional();
}
```
#### Styling
- avoid using `!important` if possible when overriding in stylesheets
- add reusable styling classes to [app/app.scss](/src/app/app.scss) which can be used in multiple pages
- only add important overrides to page SCSS to help reduce excessive custom styling
- use `color($colors, background)` to make use of [theme/variables.scss](/src/theme/variables.scss) rather than defining your own hexcolor codes

#### Pages
- remove any un-used imports
- group imports by their type (Angular, Ionic, Pages, Models, Providers) with a space in between each grouping

#### Providers
- encapsulate native plugins and service-worker functionality inside of providers so code is safe for mobile app and PWA
- long running methods or external requests should return a Promise so we can show loading indicator and chain multiple calls together

#### Models
- ensure model class has `@Table` attribute to map to the database table
- ensure model properties have `@Column` attributes to map to the database column
- add `TEXT`, `INTEGER`, `BOOLEAN`, or  `DOUBLE` option to `@Column` attribute to map to correct database column type
- add `PRIMARY_KEY` option to `@Column` attribute if it's a primary key

#### Constants
- global constants or event variables should be `ALL_CAPS`, ex `EVENT_USER_LOGOUT`
- event names should be a global constant so it's defined in a single place

#### Environments
- store access tokens and API keys in the appropriate [src/environments/*.ts](/src/environments)

#### Self-Documenting
- move inline code into a function for better readability
```
//bad
let width = (value - 0.5) * 16;

//good
let width = emToPixels(value);
emToPixels(ems:number) {
  return (ems - 0.5) * 16;
}
```
- replace conditional expression with function
```
//bad
if(!el.offsetWidth || !el.offsetHeight) {
}

//good
isVisible(el:any) {
  return el.offsetWidth && el.offsetHeight;
}

if (!isVisible(el)) {
}
```
- split math calculations for better clarification
```
//bad
return a * b + (c / d);

//good
let multiplier = a * b;
let divisor = c / d;
return multiplier + divisor;
```
- use `is` or `has` prefix for methods or variables that return `boolean`
```
//bad
open():boolean {
  return this.state === 'open';
}

//good
isOpen():boolean {
  return this.state === 'open';
}    
```
- use pure functions when possible instead of relying on state or mutable class variables
```
//bad
getWidth():number {
  return this.x + this.y;
}

//good
getWidth(x:number, y:number):number {
  return x + y;
}
```
- use variables that are consistent with the returning method
```
//bad
var node = getElement()

//good
var element = getElement();
```
- don’t use syntax tricks
```
//bad
imTricky && doMagic();

//good
if (imTricky) {
  doMagic();
}
```
- use named constants, avoid magic values
```
//bad
return 12 * 60;

//good
const HOURS = 12;
const MINUTES = 60;
return HOURS * MINUTES;
```
- use language features to your advantage
```
//bad
let ids = [];
for (var i = 0; i < things.length; i++) {
  ids.push(things[i].id);
}

//good
let ids = things.map((thing) => {
  return thing.id;
});
```

#### Variables
- use `let` instead of `var` for mutatable references
```
//bad
var count = 1;
if (true) {
  count += 1;
}

//good, use the let
let count = 1;
if (true) {
  count += 1;
}
```
- don't use reserved words as keys like `public`, `private`, etc
```
//bad
let superman = {
  default: { clark: 'kent' },
  private: true,
};

//good
let superman = {
  defaults: { clark: 'kent' },
  hidden: true,
};
```
- use readable synonyms in place of reserved words
```
//bad
let superman = {
  class: 'alien',
};

//bad
let superman = {
  klass: 'alien',
};

//good
let superman = {
  type: 'alien',
};
```
#### Arrays
- use the literal syntax for array creation
```
//bad
let items = new Array();

//good
let items = [];
```
- use `Array#push` instead of direct assignment to add items to an array
```
let someStack = [];

//bad
someStack[someStack.length] = 'abracadabra';

//good
someStack.push('abracadabra');
```
- use array spreads `...` to copy arrays
```
//bad
let len = items.length;
let itemsCopy = [];
let i;
for (i = 0; i < len; i++) {
  itemsCopy[i] = items[i];
}

//good
const itemsCopy = [...items];
```

#### Strings
- use single quotes `''` for strings when possible
```
//bad
let name = "Capt. Janeway";

//good
let name = 'Capt. Janeway';
```
- long strings should be written across multiple lines using string concatenation
```
//bad
let errorMessage = 'This is a super long error that was thrown because of Batman. When you stop to think about how Batman had anything to do with this, you would get nowhere fast.';

//bad
let errorMessage = 'This is a super long error that was thrown because \
of Batman. When you stop to think about how Batman had anything to do \
with this, you would get nowhere \
fast.';

//good
let errorMessage = 'This is a super long error that was thrown because ' +
  'of Batman. When you stop to think about how Batman had anything to do ' +
  'with this, you would get nowhere fast.';
```
- when programmatically building strings, use template strings instead of concatenation
```
//bad
sayHello(name:string) {
  return 'How are you, ' + name + '?';
}

//bad
sayHello(name:string) {
  return ['How are you, ', name, '?'].join();
}

//good
sayHello(name:string) {
  return `How are you, ${name}?`;
}
```

#### Functions
- use arrow `=>` notation instead of `function (`
```
//bad
[1, 2, 3].map(function (x) {
  return x * x;
});

//good
[1, 2, 3].map((x) => {
  return x * x;
});

//good
[1, 2, 3].map((x) => x * x;);
```

#### Properties
- use dot notation when accessing properties
```
let luke = {
  jedi: true,
  age: 28,
};

//bad
let isJedi = luke['jedi'];

//good
let isJedi = luke.jedi;
```

#### Blocks
- use braces for blocks or methods
```
//bad
if (test) return false;

//good
if (test) {
  return false;
}

//bad
myMethod() { return false; }

//good
myMethod() {
  return false;
}
```

#### Whitespace
- place one space before the leading brace
```
//bad
myMethod(){
  ...
}

//good
myMethod() {
  ...
}
```
- place one space before the opening parenthesis in control statements (`if`, `while`, etc)
```
//bad
if(isJedi) {
  fight ();
}

//bad
if (isJedi){
  fight ();
}

//good
if (isJedi) {
  fight();
}
```
