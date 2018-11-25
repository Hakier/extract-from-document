import { IMap } from '../models/map';
import { Scope } from '../models/scope';
import { Source } from '../models/source';

interface IObject {
  [key: string]: any;
}

type ICallback = (input: any) => any;

// tslint:disable:max-classes-per-file
export function extractFromDocument(recipe: Source | Scope | IMap): any {
  if (!recipe) {
    return;
  }

  class Util {
    public static map(arrayLike: NodeList, cb: ICallback): any[] {
      return Array.prototype.map.call(arrayLike, cb);
    }

    public static mapValues(obj: IObject, cb: ICallback): IObject {
      return (Object as any)
        .entries(obj)
        .reduce((agg: any, [key, val]: [string, any]) => Object.assign(agg, { [key]: cb(val) }), {});
    }

    public static isObject(obj: IObject): boolean {
      return !!(obj && typeof obj === 'object');
    }

    public static isSource({ selector, attribute }: Source): boolean {
      return !!(selector && attribute);
    }

    public static hasMap({ map }: Scope): boolean {
      return !!map;
    }
  }

  class Extractor {
    public static map(map: IMap): IObject {
      return Util.isObject(map) && Util.mapValues(map, extractFromDocument);
    }

    public static source({ selector, attribute, isSingle }: Source): string | string[] | false {
      const retrieveAttributeValue = (element: any): string => !!element ? element[attribute] : null;

      if (!selector || !attribute) {
        return false;
      }

      return isSingle
        ? retrieveAttributeValue(document.querySelector(selector))
        : Util.map(document.querySelectorAll(selector), retrieveAttributeValue);
    }
  }

  if (Util.hasMap(recipe as Scope)) {
    return Extractor.map((recipe as Scope).map);
  }

  if (Util.isSource(recipe as Source)) {
    return Extractor.source(recipe as Source);
  }

  return Extractor.map(recipe as IMap);
}
