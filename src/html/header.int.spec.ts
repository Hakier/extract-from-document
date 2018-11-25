import { Scope } from '../models/scope';
import { Source } from '../models/source';
import { extract } from './header';

describe('given Source', () => {
  describe('with truthy isSingle', () => {
    describe('when element NOT exists', () => {
      it('should return null', async () => {
        expect(await extract(new Source('not-existing-selector'))).toEqual(null);
      });
    });
    describe('when element exists', () => {
      describe('and attribute NOT exists', () => {
        it('should return undefined', async () => {
          expect(await extract(new Source('h1', 'not-existing-attribute'))).toEqual(undefined);
        });
      });
      describe('and attribute exists', () => {
        it('should return its value', async () => {
          expect(await extract(new Source('h1'))).toEqual('Header test value');
          expect(await extract(new Source('#link', 'href'))).toEqual('http://hakier.it/');
        });
      });
    });
  });
  describe('with falsy isSingle', () => {
    describe('when elements NOT exists', () => {
      it('should return null', async () => {
        expect(await extract(new Source('not-existing-selector', 'some-attribute', false))).toEqual([]);
      });
    });
    describe('when elements exists', () => {
      describe('and attribute NOT exists', () => {
        it('should return array of null', async () => {
          expect(await extract(new Source('h1', 'not-existing-attribute', false))).toEqual([null]);
        });
      });
      describe('and attribute exists', () => {
        it('should return array of values', async () => {
          const expectedLinks = ['https://google.com/', 'https://nodejs.org/'];
          expect(await extract(new Source('h1', 'innerText', false))).toEqual(['Header test value']);
          expect(await extract(new Source('nav a', 'href', false))).toEqual(expectedLinks);
        });
      });
    });
  });
});
describe('given map', () => {
  it('should return object of extracted values', async () => {
    const simpleMap = {
      header: new Source('h1'),
      link: new Source('#link', 'href'),
    };
    const expectedSimpleMapResult = {
      header: 'Header test value',
      link: 'http://hakier.it/',
    };
    const nestedMap = {
      header: new Source('h1'),
      link: {
        hrefs: new Source('nav a', 'href', false),
        values: new Source('nav a', 'innerText', false),
      },
    };
    const expectedNestedMapResult = {
      header: 'Header test value',
      link: {
        hrefs: ['https://google.com/', 'https://nodejs.org/'],
        values: ['Google', 'Node.js'],
      },
    };
    expect(await extract({})).toEqual({});
    expect(await extract(simpleMap)).toEqual(expectedSimpleMapResult);
    expect(await extract(nestedMap)).toEqual(expectedNestedMapResult);
  });
});
describe('given Scope', () => {
  describe('with only map', () => {
    it('should return structured response', async () => {
      const simpleMap = {
        header: new Source('h1'),
        link: new Source('#link', 'href'),
      };
      const expectedSimpleMapResult = {
        header: 'Header test value',
        link: 'http://hakier.it/',
      };
      const nestedMap = {
        header: new Source('h1'),
        link: {
          hrefs: new Source('nav a', 'href', false),
          values: new Source('nav a', 'innerText', false),
        },
      };
      const expectedNestedMapResult = {
        header: 'Header test value',
        link: {
          hrefs: ['https://google.com/', 'https://nodejs.org/'],
          values: ['Google', 'Node.js'],
        },
      };
      expect(await extract(new Scope(simpleMap))).toEqual(expectedSimpleMapResult);
      expect(await extract(new Scope(nestedMap))).toEqual(expectedNestedMapResult);
    });
  });
});
