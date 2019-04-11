export let TABLE:string = "Table";

// import { isDevMode } from '@angular/core';

export function Table(name:string=null): ClassDecorator {
  return (target: Function) => {
    let regex = /function (.{1,})\(/;
    let results = (regex).exec(target.toString());
    let className = (results && results.length > 1) ? results[1] : "";
    // if (isDevMode()) {
    //   console.log(`Model ${className} Table ${name || className}`);
    // }
    Object.defineProperty(target, TABLE,
      { value : name || className,
        writable : true,
        enumerable : true,
        configurable : true });
  }
}
