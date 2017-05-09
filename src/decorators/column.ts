export let COLUMNS:string = "Columns";

export function Column(name:string=null, type:string="TEXT", key:boolean=false): PropertyDecorator {
   return (target: Object, property: string | symbol) => {
     console.log(`Class ${target.constructor.name} Column ${name} Type ${type} Key ${key} Property ${property}`);
     let columns = <any[]>target.constructor[COLUMNS];
     if (columns == null) {
       columns = [];
     }
     columns.push({
       property: property,
       name: name || property,
       type: type,
       key: key });
     Object.defineProperty(target.constructor, COLUMNS,
       { value : columns,
         writable : true,
         enumerable : true,
         configurable : true });
   }
}
