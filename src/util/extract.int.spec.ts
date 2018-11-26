import { Scope } from '../models/scope';
import { Source } from '../models/source';
import { extract } from './extract';

describe('extract integration', () => {
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
    describe('with map and selector', () => {
      describe('and truthy isSingle', () => {
        it('should return structured response as object', async () => {
          const nestedMap = {
            img: {
              alt: new Source('img', 'alt'),
              src: new Source('img', 'src'),
            },
            link: {
              href: new Source('.content a', 'href'),
              value: new Source('.content a'),
            },
            title: new Source('.title'),
          };
          const nestedMapScope = {
            img: new Scope({
              alt: new Source('img', 'alt'),
              src: new Source('img', 'src'),
            }),
            link: new Scope({
              href: new Source('a', 'href'),
              value: new Source('a'),
            }, '.content'),
            title: new Source('.title'),
          };
          const expectedNestedMapResult = {
            img: {
              alt: 'ES6',
              src: 'https://cdn-images-1.medium.com/max/1200/1*aeFzjKB-7Y804GicKxk5Rg.jpeg',
            },
            link: {
              href: 'https://medium.freecodecamp.org/es6-tagged-template-literals-48a70ef3ed4d',
              value: 'ES6 Tagged Template Literals',
            },
            title: 'ES6',
          };
          expect(await extract(new Scope(nestedMap, '.knowledge .card'))).toEqual(expectedNestedMapResult);
          expect(await extract(new Scope(nestedMapScope, '.knowledge .card'))).toEqual(expectedNestedMapResult);
        });
      });
      describe('and falsy isSingle', () => {
        it('should return structured response as array of objects', async () => {
          const nestedMap = {
            img: {
              alt: new Source('img', 'alt'),
              src: new Source('img', 'src'),
            },
            link: {
              href: new Source('.content a', 'href'),
              value: new Source('.content a'),
            },
            title: new Source('.title'),
          };
          const nestedMapScope = {
            img: new Scope({
              alt: new Source('img', 'alt'),
              src: new Source('img', 'src'),
            }),
            link: new Scope({
              href: new Source('a', 'href'),
              value: new Source('a'),
            }, '.content li'),
            title: new Source('.title'),
          };
          const nestedMapScopeWithMultipleLinks = {
            img: new Scope({
              alt: new Source('img', 'alt'),
              src: new Source('img', 'src'),
            }),
            links: new Scope({
              href: new Source('a', 'href'),
              value: new Source('a'),
            }, '.content li', false),
            title: new Source('.title'),
          };
          const expectedNestedMapResult = [
            {
              img: {
                alt: 'ES6',
                src: 'https://cdn-images-1.medium.com/max/1200/1*aeFzjKB-7Y804GicKxk5Rg.jpeg',
              },
              link: {
                href: 'https://medium.freecodecamp.org/es6-tagged-template-literals-48a70ef3ed4d',
                value: 'ES6 Tagged Template Literals',
              },
              title: 'ES6',
            },
            {
              img: {
                alt: 'Code training',
                src: 'http://blog.agilepartner.net/wp-content/uploads/2015/01/Code-Kata-Superbox-ORG.png',
              },
              link: {
                href: 'http://www.codewars.com/dashboard',
                value: 'Codewars',
              },
              title: 'Code training',
            },
            {
              img: {
                alt: 'NGINIX',
                src: 'https://www.nginx.com/wp-content/themes/nginx-new/assets/img/logo.svg',
              },
              link: {
                href: 'https://easyengine.io/tutorials/nginx/enable-gzip/',
                value: 'Enable gzip compression',
              },
              title: 'NGINIX',
            },
          ];
          const expectedNestedMapScopeWithMultipleLinksResult = [
            {
              img: {
                alt: 'ES6',
                src: 'https://cdn-images-1.medium.com/max/1200/1*aeFzjKB-7Y804GicKxk5Rg.jpeg',
              },
              links: [
                {
                  href: 'https://medium.freecodecamp.org/es6-tagged-template-literals-48a70ef3ed4d',
                  value: 'ES6 Tagged Template Literals',
                },
              ],
              title: 'ES6',
            },
            {
              img: {
                alt: 'Code training',
                src: 'http://blog.agilepartner.net/wp-content/uploads/2015/01/Code-Kata-Superbox-ORG.png',
              },
              links: [
                {
                  href: 'http://www.codewars.com/dashboard',
                  value: 'Codewars',
                },
                {
                  href: 'https://www.codecademy.com/',
                  value: 'Codecademy',
                },
              ],
              title: 'Code training',
            },
            {
              img: {
                alt: 'NGINIX',
                src: 'https://www.nginx.com/wp-content/themes/nginx-new/assets/img/logo.svg',
              },
              links: [
                {
                  href: 'https://easyengine.io/tutorials/nginx/enable-gzip/',
                  value: 'Enable gzip compression',
                },
                {
                  href: 'https://www.techrepublic.com/article/how-to-configure-gzip-compression-with-nginx/',
                  value: 'How to configure gzip compression with NGINX',
                },
              ],
              title: 'NGINIX',
            },
          ];
          expect(await extract(new Scope(nestedMap, '.knowledge .card', false))).toEqual(expectedNestedMapResult);
          expect(await extract(new Scope(nestedMapScope, '.knowledge .card', false))).toEqual(expectedNestedMapResult);
          expect(await extract(new Scope(nestedMapScopeWithMultipleLinks, '.knowledge .card', false)))
            .toEqual(expectedNestedMapScopeWithMultipleLinksResult);
        });
      });
    });
  });
});
