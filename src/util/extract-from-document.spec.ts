import { Scope } from '../models/scope';
import { Source } from '../models/source';
import { extractFromDocument } from './extract-from-document';

describe('extractFromDocument', () => {
  describe('given undefined', () => {
    it('should return undefined', () => {
      expect(extractFromDocument(undefined as any)).toBeUndefined();
    });
  });
  describe('given null', () => {
    it('should return undefined', () => {
      expect(extractFromDocument(null as any)).toBeUndefined();
    });
  });
  describe('given Source', () => {
    describe('with truthy isSingle', () => {
      beforeAll(() => {
        document.querySelector = jest.fn();
        extractFromDocument(new Source('some-selector'));
      });

      it('should search for single element using selector from Source', () => {
        expect(document.querySelector).toHaveBeenCalledWith('some-selector');
      });

      describe('when element found', () => {
        describe(`and value of element's attribute is a string`, () => {
          beforeAll(() => {
            document.querySelector = jest.fn(() => ({ innerText: 'lorem ipsum' }));
          });

          it(`should return value of element property with key equal source's attribute`, () => {
            expect(extractFromDocument(new Source('some-selector', 'innerText'))).toEqual('lorem ipsum');
          });
        });
        describe(`and value of element's attribute is NOT a string`, () => {
          let el: any;

          beforeAll(() => {
            el = { toString: jest.fn() };
            document.querySelector = jest.fn(() => (el));
          });

          it(`should return value of element property with key equal source's attribute`, () => {
            expect(extractFromDocument(new Source('some-selector', 'toString'))).toEqual(el.toString);
          });
        });
      });
      describe('when element NOT found', () => {
        beforeAll(() => {
          document.querySelector = jest.fn((): null => null);
        });

        it('should return null', () => {
          expect(extractFromDocument(new Source('some-selector'))).toBeNull();
        });
      });
    });
    describe('with falsy isSingle', () => {
      beforeAll(() => {
        document.querySelector = jest.fn();
        document.querySelectorAll = jest.fn((): any[] => []);
        extractFromDocument(new Source('some-selector', 'innerText', false));
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
          expect(extractFromDocument(new Source('some-selector', 'innerText', false))).toEqual(expectedResult);
        });
      });
      describe('when elements NOT found', () => {
        beforeAll(() => {
          document.querySelectorAll = jest.fn((): any[] => []);
        });

        it('should return empty array', () => {
          expect(extractFromDocument(new Source('some-selector', 'innerText', false))).toEqual([]);
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
      expect(extractFromDocument({})).toEqual({});
      expect(extractFromDocument(recipe)).toEqual(expected);
    });
  });
  describe('given Scope', () => {
    describe('with map and selector', () => {
      describe('and truthy isSingle', () => {
        const mockedDomSingle: any = {
          '.title': { innerText: 'Node.js' },
          'img': { alt: 'Node.js logo', src: 'https://nodejs.org/static/images/logo.svg' },
        };
        const mockedDomMultiple: any = {
          '.content a': [
            { href: 'https://nodejs.org/dist/latest-v10.x/docs/api/' },
            { href: 'https://nodejs.org/dist/latest-v10.x/docs/api/async_hooks.html' },
          ],
        };
        let scope: any;
        let response: any;

        beforeAll(() => {
          const map = {
            img: {
              alt: new Source('img', 'alt'),
              src: new Source('img', 'src'),
            },
            title: new Source('.title'),
            urls: new Source('.content a', 'href', false),
          };
          scope = {
            querySelector: jest.fn((selector: string): string => mockedDomSingle[selector]),
            querySelectorAll: jest.fn((selector: string): string => mockedDomMultiple[selector]),
          };
          document.querySelector = jest.fn(() => scope);
          response = extractFromDocument(new Scope(map, '.knowledge .cart'));
        });

        it('should search for element inside document', () => {
          expect(document.querySelector).toHaveBeenCalledWith('.knowledge .cart');
        });
        it('should search for elements inside scope', () => {
          expect(scope.querySelector).toHaveBeenCalledWith('.title');
          expect(scope.querySelector).toHaveBeenCalledWith('img');
          expect(scope.querySelectorAll).toHaveBeenCalledWith('.content a');
        });
        it('should return structured response as object', () => {
          const expectedResponse = {
            img: {
              alt: 'Node.js logo',
              src: 'https://nodejs.org/static/images/logo.svg',
            },
            title: 'Node.js',
            urls: [
              'https://nodejs.org/dist/latest-v10.x/docs/api/',
              'https://nodejs.org/dist/latest-v10.x/docs/api/async_hooks.html',
            ],
          };
          expect(response).toEqual(expectedResponse);
        });
      });
      describe('and falsy isSingle', () => {
        const mockedDomSingle1: any = {
          '.title': { innerText: 'Node.js' },
          'img': { alt: 'Node.js logo', src: 'https://nodejs.org/static/images/logo.svg' },
        };
        const mockedDomMultiple1: any = {
          '.content a': [
            { href: 'https://nodejs.org/dist/latest-v10.x/docs/api/' },
            { href: 'https://nodejs.org/dist/latest-v10.x/docs/api/async_hooks.html' },
          ],
        };
        const mockedDomSingle2: any = {
          '.title': { innerText: 'TypeScript' },
          'img': { alt: 'TypeScript logo', src: 'https://www.typescriptlang.org/assets/images/logo_nocircle.svg' },
        };
        const mockedDomMultiple2: any = {
          '.content a': [
            { href: 'https://www.typescriptlang.org/docs/index.html' },
            { href: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-1.html' },
          ],
        };
        let scope1: any;
        let scope2: any;
        let response: any;

        beforeAll(() => {
          const map = {
            img: {
              alt: new Source('img', 'alt'),
              src: new Source('img', 'src'),
            },
            title: new Source('.title'),
            urls: new Source('.content a', 'href', false),
          };
          scope1 = {
            querySelector: jest.fn((selector: string): string => mockedDomSingle1[selector]),
            querySelectorAll: jest.fn((selector: string): string => mockedDomMultiple1[selector]),
          };
          scope2 = {
            querySelector: jest.fn((selector: string): string => mockedDomSingle2[selector]),
            querySelectorAll: jest.fn((selector: string): string => mockedDomMultiple2[selector]),
          };
          document.querySelectorAll = jest.fn(() => [scope1, scope2]);
          response = extractFromDocument(new Scope(map, '.knowledge .cart', false));
        });

        it('should search for elements inside document', () => {
          expect(document.querySelectorAll).toHaveBeenCalledWith('.knowledge .cart');
        });
        it('should search for elements inside scopes', () => {
          expect(scope1.querySelector).toHaveBeenCalledWith('.title');
          expect(scope1.querySelector).toHaveBeenCalledWith('img');
          expect(scope1.querySelectorAll).toHaveBeenCalledWith('.content a');
          expect(scope2.querySelector).toHaveBeenCalledWith('.title');
          expect(scope2.querySelector).toHaveBeenCalledWith('img');
          expect(scope2.querySelectorAll).toHaveBeenCalledWith('.content a');
        });
        it('should return structured response as array of objects', () => {
          const expectedResponse = [
            {
              img: {
                alt: 'Node.js logo',
                src: 'https://nodejs.org/static/images/logo.svg',
              },
              title: 'Node.js',
              urls: [
                'https://nodejs.org/dist/latest-v10.x/docs/api/',
                'https://nodejs.org/dist/latest-v10.x/docs/api/async_hooks.html',
              ],
            },
            {
              img: {
                alt: 'TypeScript logo',
                src: 'https://www.typescriptlang.org/assets/images/logo_nocircle.svg',
              },
              title: 'TypeScript',
              urls: [
                'https://www.typescriptlang.org/docs/index.html',
                'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-1.html',
              ],
            },
          ];
          expect(response).toEqual(expectedResponse);
        });
      });
    });
  });
});
