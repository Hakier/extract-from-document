import { Attribute, IMap, IRecipe, Scope, Source } from '../models';

interface IObject {
  [key: string]: any;
}

type ICallback = (input: any) => any;

type IScope = HTMLElement | Document;

// tslint:disable:max-classes-per-file
export function extractFromDocument(recipe: IRecipe, scope: IScope = document): any {
  class Util {
    public static map<T>(arrayLike: NodeList | T[], cb: ICallback): T[] {
      return Array.prototype.map.call(arrayLike, cb) as T[];
    }

    public static mapValues(obj: IObject, cb: ICallback): IObject {
      return Object
        .entries(obj)
        .reduce((agg: any, [key, val]: [string, any]) => Object.assign(agg, { [key]: cb(val) }), {});
    }

    public static isObject(obj: any): boolean {
      return !!(obj && typeof obj === 'object');
    }

    public static isString(value: any): boolean {
      return typeof value === 'string';
    }

    public static isAttribute({ attribute }: Attribute): boolean {
      return !!attribute;
    }

    public static isSource({ selector, attribute }: Source): boolean {
      return !!(selector && attribute);
    }

    public static isScope({ selector, map }: Scope): boolean {
      return !!(selector && map);
    }

    public static trimString<T = string>(value: T): T | string {
      return Util.isString(value) ? (value as any as string).trim() : value;
    }
  }

  class Extractor {
    public static map(map: IMap, innerScope: IScope | null = scope): IObject {
      return innerScope && Util.isObject(map)
        ? Util.mapValues(map, (r: IRecipe) => extractFromDocument(r, innerScope))
        : {};
    }

    public static attribute({ attribute }: Attribute): string | null | Array<string | null> {
      return this.retrieveAttributeValue(scope, attribute);
    }

    public static source({ selector, attribute, isSingle }: Source): string | null | Array<string | null> {
      return isSingle
        ? this.retrieveAttributeValue(scope.querySelector(selector), attribute)
        : Util.map<string | null>(
          scope.querySelectorAll(selector),
          (el: Element) => this.retrieveAttributeValue(el, attribute),
        );
    }

    public static scope({ map, selector, isSingle }: Scope): any {
      return isSingle
        ? Extractor.map(map, scope.querySelector<HTMLElement>(selector))
        : Util.map(scope.querySelectorAll<HTMLElement>(selector), (inner: HTMLElement) => Extractor.map(map, inner));
    }

    public static retrieveAttributeValue(el: Element | null | IScope, attribute: string): string | null {
      return !el ? null : Util.trimString((el as any)[attribute] || (el as any).getAttribute(attribute));
    }
  }

  if (Util.isString(recipe)) {
    return Extractor.source(new Source(recipe as any));
  }

  if (Array.isArray(recipe) || !Util.isObject(recipe)) {

    return;
  }
  if (Util.isSource(recipe as Source)) {

    return Extractor.source(recipe as Source);
  }

  if (Util.isScope(recipe as Scope)) {
    return Extractor.scope(recipe as Scope);
  }

  if (Util.isAttribute(recipe as Attribute)) {
    return Extractor.attribute(recipe as Attribute);
  }

  return Extractor.map(recipe as IMap);
}
