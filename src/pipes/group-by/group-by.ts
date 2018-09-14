import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'groupBy',
})
export class GroupByPipe implements PipeTransform {
  transform(collection:Array<any>, property:string, firstCharacter:boolean=true):Array<any> {
    if (!collection) {
      return [];
    }
    const groupedCollection = collection.reduce((previous, current)=> {
      let key = firstCharacter ? current[property].charAt(0).toUpperCase() : current[property];
      if (!previous[key]) {
        previous[key] = [current];
      }
      else {
        previous[key].push(current);
      }
      return previous;
    }, {});
    return Object.keys(groupedCollection).map(key => ({ key, values: groupedCollection[key] }));
  }
}
