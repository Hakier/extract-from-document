import { Scope, Source } from '../../lib/models';
import { extract } from './extract';

describe('extract integration', () => {
  const testFile = `file://${__dirname}/extract.ispec.html`;

  describe('given Source', () => {
    describe('with truthy isSingle', () => {
      describe('when element NOT exists', () => {
        it('should return null', async () => {
          expect(await extract(new Source('not-existing-selector'), testFile)).toEqual(null);
        });
      });
      describe('when element exists', () => {
        describe('and attribute NOT exists', () => {
          it('should return null', async () => {
            expect(await extract(new Source('h1', 'not-existing-attribute'), testFile)).toEqual(null);
          });
        });
        describe('and attribute exists', () => {
          it('should return its value', async () => {
            expect(await extract(new Source('h1'), testFile)).toEqual('Header test value');
            expect(await extract(new Source('#link', 'href'), testFile)).toEqual('http://hakier.it/');
          });
        });
      });
    });
    describe('with falsy isSingle', () => {
      describe('when elements NOT exists', () => {
        it('should return null', async () => {
          expect(await extract(new Source('not-existing-selector', 'some-attribute', false), testFile)).toEqual([]);
        });
      });
      describe('when elements exists', () => {
        describe('and attribute NOT exists', () => {
          it('should return array of null', async () => {
            expect(await extract(new Source('h1', 'not-existing-attribute', false), testFile)).toEqual([null]);
          });
        });
        describe('and attribute exists', () => {
          it('should return array of values', async () => {
            const expectedLinks = ['https://google.com/', 'https://nodejs.org/'];
            expect(await extract(new Source('h1', 'innerText', false), testFile)).toEqual(['Header test value']);
            expect(await extract(new Source('nav a', 'href', false), testFile)).toEqual(expectedLinks);
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
      expect(await extract({}, testFile)).toEqual({});
      expect(await extract(simpleMap, testFile)).toEqual(expectedSimpleMapResult);
      expect(await extract(nestedMap, testFile)).toEqual(expectedNestedMapResult);
    });
  });
  describe('given Scope', () => {
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
            img: {
              alt: new Source('img', 'alt'),
              src: new Source('img', 'src'),
            },
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
          const nextedMapResult = await extract(new Scope(nestedMap, '.knowledge .card'), testFile);
          const nestedMapScopeResult = await extract(new Scope(nestedMapScope, '.knowledge .card'), testFile);
          expect(nextedMapResult).toEqual(expectedNestedMapResult);
          expect(nestedMapScopeResult).toEqual(expectedNestedMapResult);
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
            img: {
              alt: new Source('img', 'alt'),
              src: new Source('img', 'src'),
            },
            link: new Scope({
              href: new Source('a', 'href'),
              value: new Source('a'),
            }, '.content li'),
            title: new Source('.title'),
          };
          const nestedMapScopeWithMultipleLinks = {
            img: {
              alt: new Source('img', 'alt'),
              src: new Source('img', 'src'),
            },
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
          expect(await extract(new Scope(nestedMap, '.knowledge .card', false), testFile))
            .toEqual(expectedNestedMapResult);
          expect(await extract(new Scope(nestedMapScope, '.knowledge .card', false), testFile))
            .toEqual(expectedNestedMapResult);
          expect(await extract(new Scope(nestedMapScopeWithMultipleLinks, '.knowledge .card', false), testFile))
            .toEqual(expectedNestedMapScopeWithMultipleLinksResult);
        });
      });
    });
  });
});
