export let TABLE:string = "Table";

export function Table(name:string=null): ClassDecorator {
  return (target: Function) => {
    var regex = /function (.{1,})\(/;
    var results = (regex).exec(target.toString());
    let className = (results && results.length > 1) ? results[1] : "";
    console.log(`Class ${className} Table ${name || className}`);
    Object.defineProperty(target, TABLE,
      { value : name || className,
        writable : true,
        enumerable : true,
        configurable : true });
  }
}
