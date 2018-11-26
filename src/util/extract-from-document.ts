import { IMap } from '../models/map';
import { IRecipe } from '../models/recipe';
import { Scope } from '../models/scope';
import { Source } from '../models/source';

interface IObject {
  [key: string]: any;
}

type ICallback = (input: any) => any;

type IScope = HTMLElement | Document;

// tslint:disable:max-classes-per-file
export function extractFromDocument(recipe: IRecipe, scope: IScope = document): any {
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

    public static isString(value: string): boolean {
      return typeof value === 'string';
    }

    public static isSource({ selector, attribute }: Source): boolean {
      return !!(selector && attribute);
    }

    public static hasMap({ map }: Scope): boolean {
      return !!map;
    }

    public static hasSelector({ selector }: Scope | Source): boolean {
      return !!selector;
    }

    public static trimString(value: string): string {
      return Util.isString(value) ? value.trim() : value;
    }
  }

  class Extractor {
    public static map(map: IMap, innerScope: IScope = scope): IObject {
      return innerScope
        && Util.isObject(map)
        && Util.mapValues(map, (r: IRecipe) => extractFromDocument(r, innerScope));
    }

    public static source({ selector, attribute, isSingle }: Source): string | string[] {
      const retrieveAttributeValue = (element: any): string => !!element ? Util.trimString(element[attribute]) : null;

      return isSingle
        ? retrieveAttributeValue(scope.querySelector(selector))
        : Util.map(scope.querySelectorAll(selector), retrieveAttributeValue);
    }

    public static scope({ map, selector, isSingle }: Scope): any {
      return isSingle
        ? Extractor.map(map, scope.querySelector<HTMLElement>(selector))
        : Util.map(scope.querySelectorAll<HTMLElement>(selector), (inner: HTMLElement) => Extractor.map(map, inner));
    }
  }

  if (Util.isSource(recipe as Source)) {
    return Extractor.source(recipe as Source);
  }

  if (Util.hasSelector(recipe as Scope)) {
    return Extractor.scope(recipe as Scope);
  }

  if (Util.hasMap(recipe as Scope)) {
    return Extractor.map((recipe as Scope).map);
  }

  return Extractor.map(recipe as IMap);
}
