import { Source } from '../models/source';
import { extractSource } from './extract-source';

describe('extractSource', () => {
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
    const mockedDom: any = { h1: { innerText: 'lorem ipsum' } };

    beforeAll(() => {
      document.querySelector = jest.fn((selector: string): string => mockedDom[selector]);
    });

    it('should return object of extracted values', () => {
      expect(extractSource({ header: new Source('h1') })).toEqual({ header: 'lorem ipsum' });
    });
  });
});
