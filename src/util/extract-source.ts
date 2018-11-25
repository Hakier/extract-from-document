import { IMap } from '../models/map';
import { Source } from '../models/source';
import { Scope } from '../models/scope';

interface IObject {
  [key: string]: any;
}

type ICallback = (input: any) => any;

export function extractSource(recipe: Source | Scope | IMap): any {
  function map(arrayLike: NodeList, cb: ICallback): any[] {
    return Array.prototype.map.call(arrayLike, cb);
  }

  function mapValues(obj: IObject, cb: ICallback): IObject {
    return (Object as any)
      .entries(obj)
      .reduce((agg: any, [key, val]: [string, any]) => Object.assign(agg, { [key]: cb(val) }), {});
  }

  function extractMap(m: IMap) {
    return mapValues(m, extractSource);
  }

  function searchForElement(r: Source): string | string[] | false {
    const { selector, attribute, isSingle } = (r as Source);
    const retrieveAttributeValue = (element: any): string => !!element ? element[attribute] : null;

    if (!selector || !attribute) {
      return false;
    }

    return isSingle
      ? retrieveAttributeValue(document.querySelector(selector))
      : map(document.querySelectorAll(selector), retrieveAttributeValue);
  }

  if (!recipe) {
    return;
  }

  if ((recipe as Scope).map) {
    return extractMap((recipe as Scope).map);
  }

  const elementValue = searchForElement(recipe as Source);

  if (elementValue !== false) {
    return elementValue;
  }

  return extractMap(recipe as IMap);
}
