import { Source } from './source';

describe('Source', () => {
  describe('given only selector', () => {
    let givenOnlySelector: Source;

    beforeAll(() => (givenOnlySelector = new Source('some-selector')));

    it('should set selector to given value', () => {
      expect(givenOnlySelector.selector).toBe('some-selector');
    });
    it('should set attribute to default value = `innerText`', () => {
      expect(givenOnlySelector.attribute).toBe('innerText');
    });
    it('should set isSingle to default value = true', () => {
      expect(givenOnlySelector.isSingle).toEqual(true);
    });
  });
  describe('given selector and attribute', () => {
    let givenSelectorAndAttribute: Source;

    beforeAll(() => (givenSelectorAndAttribute = new Source('some-selector', 'some-attribute')));

    it('should set selector to given value', () => {
      expect(givenSelectorAndAttribute.selector).toBe('some-selector');
    });
    it('should set attribute to given value', () => {
      expect(givenSelectorAndAttribute.attribute).toBe('some-attribute');
    });
    it('should set isSingle to default value = true', () => {
      expect(givenSelectorAndAttribute.isSingle).toEqual(true);
    });
  });
  describe('given selector, attribute and isSingle', () => {
    let givenSelectorAndAttributeAndIsSingle: Source;

    beforeAll(() => (givenSelectorAndAttributeAndIsSingle = new Source('some-selector', 'some-attribute', false)));

    it('should set selector to given value', () => {
      expect(givenSelectorAndAttributeAndIsSingle.selector).toBe('some-selector');
    });
    it('should set attribute to given value', () => {
      expect(givenSelectorAndAttributeAndIsSingle.attribute).toBe('some-attribute');
    });
    it('should set isSingle to given value', () => {
      expect(givenSelectorAndAttributeAndIsSingle.isSingle).toEqual(false);
    });
  });
});
