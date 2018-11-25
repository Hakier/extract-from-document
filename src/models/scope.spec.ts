import { Scope } from './scope';
import { Source } from './source';

describe('Scope', () => {
  describe('given only map', () => {
    let givenOnlyMap: Scope;

    beforeAll(() => (givenOnlyMap = new Scope({ header: new Source('h1') })));

    it('should set map', () => {
      expect(givenOnlyMap.map).toEqual({ header: new Source('h1') });
    });
    it('should set selector to undefined', () => {
      expect(givenOnlyMap.selector).toBeUndefined();
    });
    it('should set isSingle to default value = true', () => {
      expect(givenOnlyMap.isSingle).toBe(true);
    });
  });
  describe('given map and selector', () => {
    let givenMapAndSelector: Scope;

    beforeAll(() => (givenMapAndSelector = new Scope({ header: new Source('h1') }, '.header')));

    it('should set map', () => {
      expect(givenMapAndSelector.map).toEqual({ header: new Source('h1') });
    });
    it('should set selector to given value', () => {
      expect(givenMapAndSelector.selector).toBe('.header');
    });
    it('should set isSingle to default value = true', () => {
      expect(givenMapAndSelector.isSingle).toBe(true);
    });
  });
  describe('given map, selector and isSingle', () => {
    let givenMapAndSelectorAndIsSingle: Scope;

    beforeAll(() => (givenMapAndSelectorAndIsSingle = new Scope({ header: new Source('h1') }, '.header', false)));

    it('should set map', () => {
      expect(givenMapAndSelectorAndIsSingle.map).toEqual({ header: new Source('h1') });
    });
    it('should set selector to given value', () => {
      expect(givenMapAndSelectorAndIsSingle.selector).toBe('.header');
    });
    it('should set isSingle to given value', () => {
      expect(givenMapAndSelectorAndIsSingle.isSingle).toBe(false);
    });
  });
});
