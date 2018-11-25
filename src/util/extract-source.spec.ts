import { Source } from '../models/source';
import { extractSource } from './extract-source';
import { Scope } from '../models/scope';

describe('extractSource', () => {
  describe('given undefined', () => {
    it('should return undefined', () => {
      expect(extractSource(undefined)).toBeUndefined();
    });
  });
  describe('given null', () => {
    it('should return undefined', () => {
      expect(extractSource(null)).toBeUndefined();
    });
  });
  describe('given Source', () => {
    describe('with truthy isSingle', () => {
      beforeAll(() => {
        document.querySelector = jest.fn();
        extractSource(new Source('some-selector'));
      });

      it('should search for single element using selector from Source', () => {
        expect(document.querySelector).toHaveBeenCalledWith('some-selector');
      });

      describe('when element found', () => {
        beforeAll(() => {
          document.querySelector = jest.fn(() => ({ innerText: 'lorem ipsum' }));
        });

        it(`should return value of element property with key equal source's attribute`, () => {
          expect(extractSource(new Source('some-selector', 'innerText'))).toEqual('lorem ipsum');
        });
      });
      describe('when element NOT found', () => {
        beforeAll(() => {
          document.querySelector = jest.fn((): null => null);
        });

        it('should return null', () => {
          expect(extractSource(new Source('some-selector'))).toBeNull();
        });
      });
    });
    describe('with falsy isSingle', () => {
      beforeAll(() => {
        document.querySelector = jest.fn();
        document.querySelectorAll = jest.fn((): any[] => []);
        extractSource(new Source('some-selector', 'innerText', false));
      });

      it('should NOT search for single element', () => {
        expect(document.querySelector).not.toHaveBeenCalled();
      });
      it('should search for multiple elements using selector from Source', () => {
        expect(document.querySelectorAll).toHaveBeenCalledWith('some-selector');
      });

      describe('when elements found', () => {
        beforeAll(() => {
          document.querySelectorAll = jest.fn(() => ([{ innerText: 'lorem ipsum' }, { innerText: 'dolor sit amet' }]));
        });

        it(`should return value of element property with key equal source's attribute`, () => {
          const expectedResult = ['lorem ipsum', 'dolor sit amet'];
          expect(extractSource(new Source('some-selector', 'innerText', false))).toEqual(expectedResult);
        });
      });
      describe('when elements NOT found', () => {
        beforeAll(() => {
          document.querySelectorAll = jest.fn((): any[] => []);
        });

        it('should return empty array', () => {
          expect(extractSource(new Source('some-selector', 'innerText', false))).toEqual([]);
        });
      });
    });
  });
  describe('given map', () => {
    const mockedDom: any = {
      a: { href: 'http://hakier.it/', innerText: 'hakier.it' },
      h1: { innerText: 'lorem ipsum' },
    };

    beforeAll(() => {
      document.querySelector = jest.fn((selector: string): string => mockedDom[selector]);
    });

    it('should return object of extracted values', () => {
      const recipe = {
        header: new Source('h1'),
        link: {
          url: new Source('a', 'href'),
          value: new Source('a'),
        },
      };
      const expected = {
        header: 'lorem ipsum',
        link: {
          url: 'http://hakier.it/',
          value: 'hakier.it',
        },
      };
      expect(extractSource({})).toEqual({});
      expect(extractSource(recipe)).toEqual(expected);
    });
  });
  describe('given Scope', () => {
    describe('with only map', () => {
      const mockedDom: any = {
        '.title': { innerText: 'Node.js' },
        'img': { alt: 'Node.js logo', src: 'https://nodejs.org/static/images/logo.svg' },
      };

      beforeAll(() => {
        document.querySelector = jest.fn((selector: string): string => mockedDom[selector]);
      });

      it('should return structured response', () => {
        const map = {
          img: {
            alt: new Source('img', 'alt'),
            src: new Source('img', 'src'),
          },
          title: new Source('.title'),
        };
        const expected = {
          img: {
            alt: 'Node.js logo',
            src: 'https://nodejs.org/static/images/logo.svg',
          },
          title: 'Node.js',
        };
        expect(extractSource(new Scope(map, '.knowledge .cart'))).toEqual(expected);
      });
    });
  });
});
